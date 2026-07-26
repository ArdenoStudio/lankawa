/**
 * Civic food staples from lanka-price-monitor (CBSL Daily Price Report JSON).
 *
 * Third-party republish of official CBSL PDFs — not a FoodLK scrape and not a
 * Lankawa PDF parser. Prefer FoodLK when healthy; use this before lagged WFP.
 *
 * Upstream: https://github.com/wmrkumara/lanka-price-monitor
 * See docs/EXTERNAL_REPOS_ASSESSMENT.md and docs/HARTI_CBSL_FOOD_PDF.md.
 */

import type { FoodItemPrice } from "@/lib/types";

const FETCH_TIMEOUT_MS = 15_000;
const SOURCE_ID = "cbsl_price_monitor" as const;
const SOURCE_NAME = "CBSL Daily Price Report (price-monitor JSON)";

export const CBSL_PRICE_MONITOR_JSON_URL =
  process.env.CBSL_PRICE_MONITOR_JSON_URL ??
  "https://raw.githubusercontent.com/wmrkumara/lanka-price-monitor/main/data.json";

export interface PriceMonitorFoodSnapshot {
  sourceId: typeof SOURCE_ID;
  sourceName: string;
  asOf: string;
  corpusAsOf: string;
  essentialsBasketLkr: number;
  stapleItems: FoodItemPrice[];
  retailOffers: number;
  marketQuotes: number;
  staleStapleCount: number;
}

interface PriceMonitorCommodity {
  name?: string;
  category?: string;
  unit?: string;
  primaryMarket?: string;
  series?: Array<number | null>;
}

interface PriceMonitorPayload {
  generated?: string;
  source?: string;
  dates?: string[];
  commodities?: PriceMonitorCommodity[];
}

interface StapleSpec {
  slug: string;
  name: string;
  unit: string;
  basketQty: number;
  match: (commodity: string) => boolean;
  prefer: (commodity: string) => number;
}

const STAPLE_SPECS: StapleSpec[] = [
  {
    slug: "coconut",
    name: "Coconut",
    unit: "each",
    basketQty: 8,
    match: (c) => /^coconut\b/i.test(c) && !/oil/i.test(c),
    prefer: (c) => (/avg/i.test(c) ? 100 : 60),
  },
  {
    slug: "dhal",
    name: "Red dhal",
    unit: "kg",
    basketQty: 2,
    match: (c) => /dhal|dal|lentil/i.test(c),
    prefer: () => 100,
  },
  {
    slug: "sugar",
    name: "Sugar (white)",
    unit: "kg",
    basketQty: 2,
    match: (c) => /\bsugar\b/i.test(c),
    prefer: (c) => (/white/i.test(c) ? 100 : 50),
  },
  {
    slug: "big-onion",
    name: "Big onion (local)",
    unit: "kg",
    basketQty: 3,
    match: (c) => /big\s*onion/i.test(c),
    prefer: (c) => (/local/i.test(c) ? 100 : /imp/i.test(c) ? 70 : 40),
  },
  {
    slug: "potato",
    name: "Potato (local)",
    unit: "kg",
    basketQty: 3,
    match: (c) => /\bpotato\b/i.test(c),
    prefer: (c) => (/local/i.test(c) ? 100 : /imp/i.test(c) ? 70 : 40),
  },
  {
    slug: "eggs",
    name: "Egg (white)",
    unit: "each",
    basketQty: 30,
    match: (c) => /\begg\b/i.test(c),
    prefer: (c) => (/white/i.test(c) ? 100 : 50),
  },
  {
    slug: "coconut-oil",
    name: "Coconut oil",
    unit: "litre",
    basketQty: 1,
    match: (c) => /coconut\s*oil/i.test(c),
    prefer: () => 100,
  },
  {
    slug: "red-onion",
    name: "Red onion (local)",
    unit: "kg",
    basketQty: 1,
    match: (c) => /red\s*onion/i.test(c),
    prefer: (c) => (/local/i.test(c) ? 100 : 60),
  },
];

function tipPrice(
  dates: string[],
  series: Array<number | null> | undefined,
): { price: number; date: string } | null {
  if (!series?.length || !dates.length) {
    return null;
  }
  const len = Math.min(dates.length, series.length);
  for (let i = len - 1; i >= 0; i--) {
    const price = series[i];
    if (typeof price === "number" && Number.isFinite(price) && price > 0) {
      return { price, date: dates[i] };
    }
  }
  return null;
}

export function mapPriceMonitorStaples(
  payload: PriceMonitorPayload,
): PriceMonitorFoodSnapshot | null {
  const dates = payload.dates ?? [];
  const commodities = payload.commodities ?? [];
  if (dates.length === 0 || commodities.length === 0) {
    return null;
  }

  const stapleItems: FoodItemPrice[] = [];
  let essentialsBasketLkr = 0;
  let staleStapleCount = 0;

  const tipDate = dates[dates.length - 1] ?? null;
  const tipMs = tipDate ? Date.parse(tipDate) : Number.NaN;

  for (const spec of STAPLE_SPECS) {
    let best: {
      score: number;
      price: number;
      date: string;
      rawName: string;
      market?: string;
    } | null = null;

    for (const commodity of commodities) {
      const name = commodity.name?.trim();
      if (!name || !spec.match(name)) {
        continue;
      }
      const tip = tipPrice(dates, commodity.series);
      if (!tip) {
        continue;
      }
      const score = spec.prefer(name);
      if (!best || score > best.score) {
        best = {
          score,
          price: tip.price,
          date: tip.date,
          rawName: name,
          market: commodity.primaryMarket,
        };
      }
    }

    if (!best) {
      continue;
    }

    const ageDays =
      Number.isFinite(tipMs) && Number.isFinite(Date.parse(best.date))
        ? (tipMs - Date.parse(best.date)) / 86_400_000
        : 0;
    const stale = ageDays > 14;
    if (stale) {
      staleStapleCount += 1;
    } else {
      essentialsBasketLkr += best.price * spec.basketQty;
    }

    stapleItems.push({
      slug: spec.slug,
      name: spec.name,
      unit: spec.unit,
      priceLkr: Math.round(best.price),
      source: "cbsl_daily_price_report",
      quoteAsOf: best.date,
      stale,
      note: best.market
        ? `CBSL retail @ ${best.market}${stale ? " (stale tip)" : ""}`
        : stale
          ? "CBSL retail (stale tip)"
          : "CBSL Daily Price Report retail",
    });
  }

  if (stapleItems.length < 3) {
    return null;
  }

  const corpusAsOf = tipDate ?? stapleItems[0]?.quoteAsOf ?? "unknown";
  const asOf =
    typeof payload.generated === "string" && payload.generated.length > 0
      ? payload.generated.endsWith("Z")
        ? payload.generated
        : `${payload.generated}+05:30`
      : `${corpusAsOf}T12:00:00+05:30`;

  return {
    sourceId: SOURCE_ID,
    sourceName: SOURCE_NAME,
    asOf,
    corpusAsOf,
    essentialsBasketLkr: Math.round(essentialsBasketLkr),
    stapleItems,
    retailOffers: stapleItems.length,
    marketQuotes: commodities.length,
    staleStapleCount,
  };
}

export async function fetchCbslPriceMonitorFood(): Promise<PriceMonitorFoodSnapshot | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(CBSL_PRICE_MONITOR_JSON_URL, {
      signal: controller.signal,
      next: { revalidate: 21_600 },
      headers: {
        Accept: "application/json",
        "User-Agent": "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)",
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as PriceMonitorPayload;
    return mapPriceMonitorStaples(payload);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
