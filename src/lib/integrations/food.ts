import { getFoodSnapshot } from "@/lib/food";
import { fetchWfpFoodDirect } from "@/lib/integrations/food-direct";
import { fetchSpar2uRetail } from "@/lib/integrations/food-spar";
import type {
  FoodDistrictMealCost,
  FoodItemPrice,
  FoodSnapshot,
} from "@/lib/types";

const FOOD_API_BASE =
  process.env.FOOD_API_BASE ?? "https://food-platform-backend.fly.dev/api/v1";

const LIFE_API_BASE =
  process.env.LIFE_API_BASE ?? "https://life-platform-backend.fly.dev/api/v1";

const FETCH_TIMEOUT_MS = 8000;

export type FoodProvenance =
  | "live"
  | "wfp_hdx"
  | "spar2u"
  | "life_federation"
  | "seed";

export interface FoodFetchResult extends FoodSnapshot {
  provenance: FoodProvenance;
  upstreamStatus?: "healthy" | "degraded" | "offline";
  mixedSeedDistricts?: boolean;
}

interface LifeFoodDomain {
  key: string;
  status?: "healthy" | "degraded" | "down" | "seed";
  observed_at?: string;
  last_updated_at?: string;
  metrics?: Array<{ label: string; value: number; unit: string }>;
  top_items?: Array<{ label: string; price_lkr: number; source: string }>;
  errors?: string[];
}

interface LifeOverviewResponse {
  generated_at: string;
  domains?: LifeFoodDomain[];
}

function slugifyItem(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** True only when FoodLK JSON carries real metric counts — not an empty 200 shell. */
export function foodLkPayloadHasMetrics(
  payload: Record<string, unknown>,
): boolean {
  if ("detail" in payload) {
    return false;
  }

  const numericKeys = [
    "offers_count",
    "sources_count",
    "categories_count",
    "retail_offers",
    "market_quotes",
    "market_quotes_count",
    "essentials_basket_lkr",
    "essentialsBasketLkr",
  ] as const;

  for (const key of numericKeys) {
    const value = payload[key];
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return true;
    }
  }

  const items = payload.items;
  if (Array.isArray(items) && items.length > 0) {
    return true;
  }

  const staples = payload.staple_items ?? payload.stapleItems;
  if (Array.isArray(staples) && staples.length > 0) {
    return true;
  }

  const cheapest = payload.cheapest_offers ?? payload.cheapestOffers;
  if (Array.isArray(cheapest) && cheapest.length > 0) {
    return true;
  }

  return false;
}

function mapFoodLkPayload(
  payload: Record<string, unknown>,
): FoodFetchResult | null {
  if (!foodLkPayloadHasMetrics(payload)) {
    return null;
  }

  const seed = getFoodSnapshot();
  const essentialsRaw =
    payload.essentials_basket_lkr ?? payload.essentialsBasketLkr;
  const retailRaw = payload.offers_count ?? payload.retail_offers;
  const marketRaw =
    payload.market_quotes_count ??
    payload.market_quotes ??
    payload.marketQuotes;

  return {
    ...seed,
    provenance: "live",
    sourceId: "food_platform_api",
    sourceName: "FoodLK Price Intelligence",
    asOf:
      typeof payload.last_scrape_at === "string"
        ? payload.last_scrape_at
        : new Date().toISOString(),
    essentialsBasketLkr:
      typeof essentialsRaw === "number" && essentialsRaw > 0
        ? Math.round(essentialsRaw)
        : seed.essentialsBasketLkr,
    retailOffers:
      typeof retailRaw === "number" && retailRaw > 0
        ? Math.round(retailRaw)
        : seed.retailOffers,
    marketQuotes:
      typeof marketRaw === "number" && marketRaw > 0
        ? Math.round(marketRaw)
        : seed.marketQuotes,
    mixedSeedDistricts: true,
  };
}

function mapLifeFoodDomain(domain: LifeFoodDomain): FoodFetchResult {
  const seed = getFoodSnapshot();
  const essentials = domain.metrics?.find((metric) =>
    metric.label.toLowerCase().includes("essentials"),
  );
  const retailOffers = domain.metrics?.find((metric) =>
    metric.label.toLowerCase().includes("retail"),
  );
  const marketQuotes = domain.metrics?.find((metric) =>
    metric.label.toLowerCase().includes("market"),
  );

  const stapleItems: FoodItemPrice[] =
    domain.top_items?.map((item) => ({
      slug: slugifyItem(item.label),
      name: item.label,
      unit: "unit",
      priceLkr: Math.round(item.price_lkr),
      source: item.source,
    })) ?? seed.stapleItems;

  const upstreamStatus =
    domain.status === "healthy"
      ? "healthy"
      : domain.status === "degraded"
        ? "degraded"
        : "offline";

  return {
    ...seed,
    provenance: "life_federation",
    sourceId: "life_platform_food",
    sourceName: "Ariva Life Platform (Food)",
    asOf: domain.observed_at ?? domain.last_updated_at ?? seed.asOf,
    essentialsBasketLkr: Math.round(
      essentials?.value ?? seed.essentialsBasketLkr,
    ),
    retailOffers: Math.round(retailOffers?.value ?? seed.retailOffers),
    marketQuotes: Math.round(marketQuotes?.value ?? seed.marketQuotes),
    stapleItems,
    districts: seed.districts,
    upstreamStatus,
    mixedSeedDistricts: true,
  };
}

/** Skip Life when it is seed/down fixture-only; degraded with metrics is OK. */
function isUsableLifeFoodDomain(domain: LifeFoodDomain): boolean {
  if (domain.status === "seed" || domain.status === "down") {
    return false;
  }

  const hasItems = (domain.top_items?.length ?? 0) > 0;
  const hasMetrics = (domain.metrics?.length ?? 0) > 0;
  return hasItems || hasMetrics;
}

async function fetchFoodLkLive(): Promise<FoodFetchResult | null> {
  const directEndpoints = [
    `${FOOD_API_BASE}/stats/summary`,
    `${FOOD_API_BASE}/categories/summary`,
    `${FOOD_API_BASE}/home/summary`,
  ];

  for (const endpoint of directEndpoints) {
    const payload = await fetchJson<Record<string, unknown>>(endpoint);
    if (!payload || typeof payload !== "object") {
      continue;
    }
    const mapped = mapFoodLkPayload(payload);
    if (mapped) {
      return mapped;
    }
  }

  return null;
}

async function fetchLifeFood(): Promise<FoodFetchResult | null> {
  const lifeOverview = await fetchJson<LifeOverviewResponse>(
    `${LIFE_API_BASE}/life/overview`,
  );
  const foodDomain = lifeOverview?.domains?.find(
    (domain) => domain.key === "food",
  );
  if (foodDomain && isUsableLifeFoodDomain(foodDomain)) {
    return mapLifeFoodDomain(foodDomain);
  }
  return null;
}

export async function fetchFoodSnapshot(): Promise<FoodFetchResult | null> {
  const foodLk = await fetchFoodLkLive();
  if (foodLk) {
    return foodLk;
  }

  const wfp = await fetchWfpFoodDirect();
  if (wfp) {
    const seed = getFoodSnapshot();
    return {
      ...seed,
      provenance: "wfp_hdx",
      sourceId: wfp.sourceId,
      sourceName: wfp.sourceName,
      asOf: wfp.asOf,
      corpusAsOf: wfp.corpusAsOf,
      staleStapleCount: wfp.staleStapleCount,
      essentialsBasketLkr: wfp.essentialsBasketLkr,
      retailOffers: wfp.retailOffers,
      marketQuotes: wfp.marketQuotes,
      // Staples already carry note / stale / quoteAsOf from WFP mapping.
      stapleItems: wfp.stapleItems,
      districts: seed.districts,
      mixedSeedDistricts: true,
    };
  }

  const spar = await fetchSpar2uRetail();
  if (spar) {
    const seed = getFoodSnapshot();
    return {
      ...seed,
      provenance: "spar2u",
      sourceId: spar.sourceId,
      sourceName: spar.sourceName,
      asOf: spar.asOf,
      essentialsBasketLkr: spar.essentialsBasketLkr,
      retailOffers: spar.retailOffers,
      marketQuotes: spar.marketQuotes,
      stapleItems: spar.stapleItems,
      districts: seed.districts,
      mixedSeedDistricts: true,
    };
  }

  return fetchLifeFood();
}

export async function getFoodData(): Promise<FoodFetchResult> {
  const live = await fetchFoodSnapshot();
  if (live) {
    return live;
  }

  return {
    ...getFoodSnapshot(),
    provenance: "seed",
    mixedSeedDistricts: true,
  };
}

export function getFoodDistrictMealCosts(): FoodDistrictMealCost[] {
  return getFoodSnapshot().districts;
}
