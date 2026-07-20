import type { FoodItemPrice } from "@/lib/types";

const FETCH_TIMEOUT_MS = 20_000;
const WFP_SOURCE_ID = "wfp_hdx";
const WFP_SOURCE_NAME = "WFP HDX food prices (Sri Lanka)";

/** Prefer staples whose latest retail quote is within this many days of the corpus tip. */
const FRESH_WINDOW_DAYS = 45;
/** Older than this → mark staple as stale (sugar/flour often lag years). */
const STALE_AFTER_DAYS = 120;

/** Working HDX download (probed Jul 2026). Without `_lka` → S3 NoSuchKey. */
export const WFP_HDX_CSV_URLS = [
  "https://data.humdata.org/dataset/0298c598-d312-4771-b564-f4ac4d831f05/resource/3638f0d6-9969-48cf-a919-1d879d037ec6/download/wfp_food_prices_lka.csv",
  "https://data.humdata.org/dataset/0298c598-d312-4771-b564-f4ac4d831f05/resource/3638f0d6-9969-48cf-a919-1d879d037ec6/download/wfp_food_prices.csv",
] as const;

export interface WfpFoodDirectSnapshot {
  sourceId: typeof WFP_SOURCE_ID;
  sourceName: string;
  asOf: string;
  /** Human calendar tip of the corpus (YYYY-MM-DD), for loud UI. */
  corpusAsOf: string;
  essentialsBasketLkr: number;
  stapleItems: FoodItemPrice[];
  retailOffers: number;
  marketQuotes: number;
  staleStapleCount: number;
}

interface WfpRow {
  date: string;
  commodity: string;
  category: string;
  pricetype: string;
  price: number;
  unit: string;
}

interface StapleSpec {
  slug: string;
  name: string;
  unit: string;
  /** Higher = preferred when multiple commodities match (e.g. Rice white > red nadu). */
  prefer: (commodity: string) => number;
  match: (commodity: string) => boolean;
  /** Rough monthly household qty; contributes to essentials basket only when quote is non-stale. */
  basketQty: number;
}

const STAPLE_SPECS: StapleSpec[] = [
  {
    slug: "rice",
    name: "Rice (white)",
    unit: "kg",
    match: (c) => /\brice\b/i.test(c) && !/fuel/i.test(c),
    prefer: (c) => {
      if (/white/i.test(c)) return 100;
      if (/medium grain/i.test(c)) return 80;
      if (/long grain/i.test(c)) return 70;
      if (/red nadu/i.test(c)) return 20;
      return 40;
    },
    basketQty: 10,
  },
  {
    slug: "big-onion",
    name: "Onions",
    unit: "kg",
    match: (c) => /\bonion/i.test(c),
    prefer: (c) => {
      if (/red, local/i.test(c)) return 100;
      if (/imported/i.test(c)) return 80;
      return 50;
    },
    basketQty: 3,
  },
  {
    slug: "dhal",
    name: "Lentils / dhal",
    unit: "kg",
    match: (c) => /lentil|dhal|dal/i.test(c),
    prefer: () => 100,
    basketQty: 2,
  },
  {
    slug: "coconut",
    name: "Coconut",
    unit: "each",
    match: (c) => /^coconut$/i.test(c.trim()),
    prefer: () => 100,
    basketQty: 8,
  },
  {
    slug: "eggs",
    name: "Eggs",
    unit: "each",
    match: (c) => /^eggs$/i.test(c.trim()),
    prefer: () => 100,
    basketQty: 30,
  },
  {
    slug: "sugar",
    name: "Sugar",
    unit: "kg",
    match: (c) => /\bsugar\b/i.test(c),
    prefer: () => 100,
    basketQty: 2,
  },
  {
    slug: "wheat",
    name: "Wheat flour",
    unit: "kg",
    match: (c) => /wheat flour/i.test(c),
    prefer: () => 100,
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

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;
  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000);
}

/** Drop fuel and non-food categories — never treat as staples. */
export function isFoodCommodityRow(row: Pick<WfpRow, "commodity" | "category">): boolean {
  const commodity = row.commodity.toLowerCase();
  const category = row.category.toLowerCase();
  if (/fuel|petrol|diesel|gasoline/.test(commodity)) return false;
  if (category === "non-food" || category.startsWith("non-food")) return false;
  return true;
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
  const categoryIdx = header.indexOf("category");
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
    const row: WfpRow = {
      date,
      commodity,
      category: categoryIdx >= 0 ? (cells[categoryIdx] ?? "") : "",
      pricetype: priceTypeIdx >= 0 ? (cells[priceTypeIdx] ?? "") : "",
      price,
      unit: unitIdx >= 0 ? (cells[unitIdx] ?? "KG") : "KG",
    };
    if (!isFoodCommodityRow(row)) {
      continue;
    }
    rows.push(row);
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

function corpusTipDate(rows: WfpRow[]): string {
  let tip = "";
  for (const row of rows) {
    if (row.date > tip) tip = row.date;
  }
  return tip;
}

function latestPriceForSpec(
  rows: WfpRow[],
  spec: StapleSpec,
  corpusTip: Date,
): { row: WfpRow; stale: boolean; quoteDate: string } | null {
  const matches = rows.filter((row) => spec.match(row.commodity));
  if (matches.length === 0) {
    return null;
  }

  // Prefer commodities with coverage near the corpus tip (e.g. 2025-09 white rice).
  const freshEnough = matches.filter((row) => {
    const d = parseIsoDate(row.date);
    return d != null && daysBetween(d, corpusTip) <= FRESH_WINDOW_DAYS;
  });
  const pool = freshEnough.length > 0 ? freshEnough : matches;

  pool.sort((a, b) => {
    const byPrefer = spec.prefer(b.commodity) - spec.prefer(a.commodity);
    if (byPrefer !== 0) return byPrefer;
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return preferPriceType(a.pricetype, b.pricetype);
  });

  const topCommodity = pool[0].commodity;
  const sameCommodity = pool.filter((row) => row.commodity === topCommodity);
  sameCommodity.sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return preferPriceType(a.pricetype, b.pricetype);
  });

  const latestDate = sameCommodity[0].date;
  const sameDay = sameCommodity.filter((row) => row.date === latestDate);
  sameDay.sort((a, b) => preferPriceType(a.pricetype, b.pricetype));

  const preferredType = sameDay[0].pricetype;
  const cohort = sameDay.filter(
    (row) => row.pricetype.toLowerCase() === preferredType.toLowerCase(),
  );
  const mean =
    cohort.reduce((sum, row) => sum + row.price, 0) / Math.max(cohort.length, 1);

  const quoteDate = latestDate;
  const quoteDay = parseIsoDate(quoteDate);
  const stale =
    quoteDay == null || daysBetween(quoteDay, corpusTip) > STALE_AFTER_DAYS;

  return {
    row: { ...sameDay[0], price: mean },
    stale,
    quoteDate,
  };
}

/** Build staples + essentials basket from parsed WFP rows (exported for tests). */
export function buildWfpFoodSnapshot(rows: WfpRow[]): WfpFoodDirectSnapshot | null {
  if (rows.length === 0) {
    return null;
  }

  const tip = corpusTipDate(rows);
  const tipDate = parseIsoDate(tip);
  if (!tip || !tipDate) {
    return null;
  }

  const stapleItems: FoodItemPrice[] = [];
  let quoteCount = 0;
  let staleStapleCount = 0;

  for (const spec of STAPLE_SPECS) {
    const hit = latestPriceForSpec(rows, spec, tipDate);
    if (!hit) {
      continue;
    }
    const priceLkr = Math.round(hit.row.price);
    const stale = hit.stale;
    if (stale) staleStapleCount += 1;

    stapleItems.push({
      slug: spec.slug,
      name: spec.name,
      unit: spec.unit,
      priceLkr,
      source: hit.row.pricetype
        ? `wfp_${hit.row.pricetype.toLowerCase()}`
        : "wfp_hdx",
      note: stale
        ? `Stale quote (${hit.quoteDate}) — not current market`
        : `Market average as of ${hit.quoteDate}`,
      stale,
      quoteAsOf: hit.quoteDate,
    });

    quoteCount += 1;
  }

  // Essentials basket honesty (WFP): non-stale staples only — lagged quotes stay visible but excluded.
  let basket = 0;
  for (const spec of STAPLE_SPECS) {
    const item = stapleItems.find((s) => s.slug === spec.slug);
    if (!item || item.stale) continue;
    basket += item.priceLkr * spec.basketQty;
  }

  if (stapleItems.filter((s) => !s.stale).length < 3) {
    return null;
  }

  return {
    sourceId: WFP_SOURCE_ID,
    sourceName: WFP_SOURCE_NAME,
    asOf: `${tip}T00:00:00.000Z`,
    corpusAsOf: tip,
    essentialsBasketLkr: Math.round(basket),
    stapleItems,
    retailOffers: quoteCount,
    marketQuotes: rows.length,
    staleStapleCount,
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
