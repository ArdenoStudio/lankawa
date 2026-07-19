import { getFoodSnapshot } from "@/lib/food";
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

interface LifeFoodDomain {
  key: string;
  observed_at?: string;
  last_updated_at?: string;
  metrics?: Array<{ label: string; value: number; unit: string }>;
  top_items?: Array<{ label: string; price_lkr: number; source: string }>;
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

function mapLifeFoodDomain(domain: LifeFoodDomain): FoodSnapshot | null {
  if (domain.key !== "food") {
    return null;
  }

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

  return {
    ...seed,
    sourceId: "food_platform_api",
    sourceName: "FoodLK Price Intelligence",
    asOf: domain.observed_at ?? domain.last_updated_at ?? seed.asOf,
    essentialsBasketLkr: Math.round(
      essentials?.value ?? seed.essentialsBasketLkr,
    ),
    retailOffers: Math.round(retailOffers?.value ?? seed.retailOffers),
    marketQuotes: Math.round(marketQuotes?.value ?? seed.marketQuotes),
    stapleItems,
    districts: seed.districts,
  };
}

export async function fetchFoodSnapshot(): Promise<FoodSnapshot | null> {
  const directEndpoints = [
    `${FOOD_API_BASE}/stats/summary`,
    `${FOOD_API_BASE}/categories/summary`,
    `${FOOD_API_BASE}/home/summary`,
  ];

  for (const endpoint of directEndpoints) {
    const payload = await fetchJson<Record<string, unknown>>(endpoint);
    if (payload && typeof payload === "object" && !("detail" in payload)) {
      const seed = getFoodSnapshot();
      return {
        ...seed,
        sourceId: "food_platform_api",
        sourceName: "FoodLK Price Intelligence",
        asOf: new Date().toISOString(),
      };
    }
  }

  const lifeOverview = await fetchJson<LifeOverviewResponse>(
    `${LIFE_API_BASE}/life/overview`,
  );
  const foodDomain = lifeOverview?.domains?.find(
    (domain) => domain.key === "food",
  );
  if (foodDomain) {
    return mapLifeFoodDomain(foodDomain);
  }

  return null;
}

export async function getFoodData(): Promise<FoodSnapshot> {
  const live = await fetchFoodSnapshot();
  return live ?? getFoodSnapshot();
}

export function getFoodDistrictMealCosts(): FoodDistrictMealCost[] {
  return getFoodSnapshot().districts;
}
