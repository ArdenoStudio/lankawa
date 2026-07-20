import type { FoodItemPrice } from "@/lib/types";

const FETCH_TIMEOUT_MS = 20_000;
const WFP_SOURCE_ID = "wfp_hdx";
const WFP_SOURCE_NAME = "WFP HDX food prices (Sri Lanka)";

/** Working HDX download (probed Jul 2026). Without `_lka` → S3 NoSuchKey. */
export const WFP_HDX_CSV_URLS = [
  "https://data.humdata.org/dataset/0298c598-d312-4771-b564-f4ac4d831f05/resource/3638f0d6-9969-48cf-a919-1d879d037ec6/download/wfp_food_prices_lka.csv",
  "https://data.humdata.org/dataset/0298c598-d312-4771-b564-f4ac4d831f05/resource/3638f0d6-9969-48cf-a919-1d879d037ec6/download/wfp_food_prices.csv",
] as const;

export interface WfpFoodDirectSnapshot {
  sourceId: typeof WFP_SOURCE_ID;
  sourceName: string;
  asOf: string;
  essentialsBasketLkr: number;
  stapleItems: FoodItemPrice[];
  retailOffers: number;
  marketQuotes: number;
}

interface WfpRow {
  date: string;
  commodity: string;
  pricetype: string;
  price: number;
  unit: string;
}

interface StapleSpec {
  slug: string;
  name: string;
  unit: string;
  match: (commodity: string) => boolean;
  /** Rough monthly household qty for essentials basket estimate. */
  basketQty: number;
}

const STAPLE_SPECS: StapleSpec[] = [
  {
    slug: "rice",
    name: "Rice",
    unit: "kg",
    match: (c) => /\brice\b/i.test(c),
    basketQty: 10,
  },
  {
    slug: "big-onion",
    name: "Onions",
    unit: "kg",
    match: (c) => /\bonion/i.test(c),
    basketQty: 3,
  },
  {
    slug: "dhal",
    name: "Lentils / dhal",
    unit: "kg",
    match: (c) => /lentil|dhal|dal/i.test(c),
    basketQty: 2,
  },
  {
    slug: "coconut",
    name: "Coconut",
    unit: "each",
    match: (c) => /^coconut$/i.test(c.trim()) || /\bcoconut\b/i.test(c),
    basketQty: 8,
  },
  {
    slug: "sugar",
    name: "Sugar",
    unit: "kg",
    match: (c) => /\bsugar\b/i.test(c),
    basketQty: 2,
  },
  {
    slug: "wheat",
    name: "Wheat flour",
    unit: "kg",
    match: (c) => /wheat/i.test(c),
    basketQty: 3,
  },
];

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

/** Parse WFP HDX CSV text into typed rows (exported for unit tests). */
export function parseWfpFoodPricesCsv(csv: string): WfpRow[] {
  const lines = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const dateIdx = header.indexOf("date");
  const commodityIdx = header.indexOf("commodity");
  const priceTypeIdx = header.indexOf("pricetype");
  const priceIdx = header.indexOf("price");
  const unitIdx = header.indexOf("unit");
  const currencyIdx = header.indexOf("currency");

  if (dateIdx < 0 || commodityIdx < 0 || priceIdx < 0) {
    return [];
  }

  const rows: WfpRow[] = [];
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const date = cells[dateIdx] ?? "";
    const commodity = cells[commodityIdx] ?? "";
    const price = Number(cells[priceIdx]);
    if (!date || !commodity || !Number.isFinite(price) || price <= 0) {
      continue;
    }
    const currency = currencyIdx >= 0 ? (cells[currencyIdx] ?? "").toUpperCase() : "LKR";
    if (currency && currency !== "LKR") {
      continue;
    }
    rows.push({
      date,
      commodity,
      pricetype: priceTypeIdx >= 0 ? (cells[priceTypeIdx] ?? "") : "",
      price,
      unit: unitIdx >= 0 ? (cells[unitIdx] ?? "KG") : "KG",
    });
  }

  return rows;
}

function preferPriceType(a: string, b: string): number {
  const rank = (value: string) => {
    const v = value.toLowerCase();
    if (v === "retail") return 0;
    if (v === "wholesale") return 1;
    return 2;
  };
  return rank(a) - rank(b);
}

function latestPriceForSpec(rows: WfpRow[], spec: StapleSpec): WfpRow | null {
  const matches = rows.filter((row) => spec.match(row.commodity));
  if (matches.length === 0) {
    return null;
  }

  matches.sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return preferPriceType(a.pricetype, b.pricetype);
  });

  const latestDate = matches[0].date;
  const sameDay = matches.filter((row) => row.date === latestDate);
  sameDay.sort((a, b) => preferPriceType(a.pricetype, b.pricetype));

  // Prefer retail mean on the latest date when several markets exist.
  const preferredType = sameDay[0].pricetype;
  const cohort = sameDay.filter(
    (row) => row.pricetype.toLowerCase() === preferredType.toLowerCase(),
  );
  const mean =
    cohort.reduce((sum, row) => sum + row.price, 0) / Math.max(cohort.length, 1);

  return {
    ...sameDay[0],
    price: mean,
  };
}

/** Build staples + essentials basket from parsed WFP rows (exported for tests). */
export function buildWfpFoodSnapshot(rows: WfpRow[]): WfpFoodDirectSnapshot | null {
  if (rows.length === 0) {
    return null;
  }

  const stapleItems: FoodItemPrice[] = [];
  let asOf = "";
  let basket = 0;
  let quoteCount = 0;

  for (const spec of STAPLE_SPECS) {
    // Coconut oil should not win over whole coconut when both match /\bcoconut\b/.
    const scoped =
      spec.slug === "coconut"
        ? rows.filter((row) => !/oil/i.test(row.commodity))
        : rows;
    const hit = latestPriceForSpec(scoped, spec);
    if (!hit) {
      continue;
    }
    const priceLkr = Math.round(hit.price);
    stapleItems.push({
      slug: spec.slug,
      name: spec.name,
      unit: spec.unit,
      priceLkr,
      source: hit.pricetype ? `wfp_${hit.pricetype.toLowerCase()}` : "wfp_hdx",
    });
    basket += priceLkr * spec.basketQty;
    quoteCount += 1;
    if (!asOf || hit.date > asOf) {
      asOf = hit.date;
    }
  }

  if (stapleItems.length < 3 || !asOf) {
    return null;
  }

  return {
    sourceId: WFP_SOURCE_ID,
    sourceName: WFP_SOURCE_NAME,
    asOf: `${asOf}T00:00:00.000Z`,
    essentialsBasketLkr: Math.round(basket),
    stapleItems,
    retailOffers: quoteCount,
    marketQuotes: rows.length,
  };
}

async function fetchCsvText(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 86_400 },
      headers: {
        Accept: "text/csv,text/plain,*/*",
        "User-Agent":
          "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)",
      },
    });

    if (!response.ok) {
      return null;
    }

    const text = await response.text();
    if (!text || text.includes("<Error>") || text.includes("NoSuchKey")) {
      return null;
    }
    if (!text.toLowerCase().includes("commodity")) {
      return null;
    }
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Fetch WFP HDX CSV and return a food-direct snapshot, or null on failure. */
export async function fetchWfpFoodDirect(): Promise<WfpFoodDirectSnapshot | null> {
  for (const url of WFP_HDX_CSV_URLS) {
    const csv = await fetchCsvText(url);
    if (!csv) {
      continue;
    }
    const snapshot = buildWfpFoodSnapshot(parseWfpFoodPricesCsv(csv));
    if (snapshot) {
      return snapshot;
    }
  }
  return null;
}
