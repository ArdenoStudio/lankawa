import type { FoodItemPrice } from "@/lib/types";

const FETCH_TIMEOUT_MS = 12_000;
const SPAR_URL = "https://spar2u.lk/products.json?limit=250";
const SPAR_SOURCE_ID = "spar2u_retail" as const;
const SPAR_SOURCE_NAME = "SPAR2U retail catalog";

export interface SparRetailSnapshot {
  sourceId: typeof SPAR_SOURCE_ID;
  sourceName: string;
  asOf: string;
  essentialsBasketLkr: number;
  stapleItems: FoodItemPrice[];
  retailOffers: number;
  marketQuotes: number;
}

interface SparVariant {
  price?: string | number;
  available?: boolean;
}

interface SparProduct {
  title?: string;
  updated_at?: string;
  variants?: SparVariant[];
}

interface SparCatalog {
  products?: SparProduct[];
}

interface StapleSpec {
  slug: string;
  name: string;
  unit: string;
  match: (title: string) => boolean;
  /** Rough monthly household qty for essentials basket estimate. */
  basketQty: number;
}

const STAPLE_SPECS: StapleSpec[] = [
  {
    slug: "rice",
    name: "Rice",
    unit: "kg",
    match: (t) => /\brice\b/i.test(t) && !/flour|paper|vinegar/i.test(t),
    basketQty: 10,
  },
  {
    slug: "dhal",
    name: "Lentils / dhal",
    unit: "kg",
    match: (t) => /\b(dhal|dal|lentil)/i.test(t),
    basketQty: 2,
  },
  {
    slug: "big-onion",
    name: "Onions",
    unit: "kg",
    match: (t) => /\bonion/i.test(t),
    basketQty: 3,
  },
  {
    slug: "sugar",
    name: "Sugar",
    unit: "kg",
    match: (t) => /\bsugar\b/i.test(t) && !/candy|free|substitute/i.test(t),
    basketQty: 2,
  },
  {
    slug: "coconut",
    name: "Coconut",
    unit: "each",
    match: (t) =>
      /\bcoconut\b/i.test(t) && !/oil|milk|cream|water|desiccat|flakes|sugar/i.test(t),
    basketQty: 8,
  },
  {
    slug: "wheat",
    name: "Wheat flour",
    unit: "kg",
    match: (t) =>
      /wheat\s*flour/i.test(t) ||
      (/\bflour\b/i.test(t) && !/rice|coconut|chickpea|gram/i.test(t)),
    basketQty: 3,
  },
];

/** Parse pack size in kg from a product title; default 1. */
export function packKgFromTitle(title: string): number {
  const kg = title.match(/(\d+(?:\.\d+)?)\s*kg\b/i);
  if (kg) {
    const n = Number(kg[1]);
    if (Number.isFinite(n) && n > 0 && n <= 50) return n;
  }
  const g = title.match(/(\d+(?:\.\d+)?)\s*g\b/i);
  if (g) {
    const n = Number(g[1]);
    if (Number.isFinite(n) && n >= 100) return n / 1000;
  }
  return 1;
}

function variantPrice(product: SparProduct): number | null {
  const variants = product.variants ?? [];
  for (const variant of variants) {
    const raw = Number(variant.price);
    if (Number.isFinite(raw) && raw > 0) {
      return raw;
    }
  }
  return null;
}

/** True when unit price looks like a grocery staple, not a bulk/weird SKU. */
export function isReasonableStaplePrice(
  unitPriceLkr: number,
  slug: string,
): boolean {
  if (!Number.isFinite(unitPriceLkr) || unitPriceLkr <= 0) return false;
  if (slug === "coconut") {
    return unitPriceLkr >= 40 && unitPriceLkr <= 800;
  }
  // Per-kg bands for rice/dhal/onion/sugar/flour.
  return unitPriceLkr >= 80 && unitPriceLkr <= 2500;
}

/**
 * Build staples + essentials basket from a SPAR2U products.json fragment
 * (exported for unit tests — no network).
 */
export function buildSparRetailSnapshot(
  catalog: SparCatalog,
): SparRetailSnapshot | null {
  const products = catalog.products;
  if (!Array.isArray(products) || products.length === 0) {
    return null;
  }

  const found = new Map<string, FoodItemPrice>();
  let asOf = "";

  for (const product of products) {
    const title = typeof product.title === "string" ? product.title : "";
    if (!title) continue;

    const packPrice = variantPrice(product);
    if (packPrice == null) continue;

    for (const spec of STAPLE_SPECS) {
      if (found.has(spec.slug)) continue;
      if (!spec.match(title)) continue;

      const packKg = spec.unit === "kg" ? packKgFromTitle(title) : 1;
      const unitPrice = packPrice / packKg;
      if (!isReasonableStaplePrice(unitPrice, spec.slug)) continue;

      found.set(spec.slug, {
        slug: spec.slug,
        name: spec.name,
        unit: spec.unit,
        priceLkr: Math.round(unitPrice),
        source: "spar2u_retail",
      });

      const updated =
        typeof product.updated_at === "string" ? product.updated_at : "";
      if (updated && (!asOf || updated > asOf)) {
        asOf = updated;
      }
    }

    if (found.size === STAPLE_SPECS.length) break;
  }

  if (found.size < 3) {
    return null;
  }

  const stapleItems = STAPLE_SPECS.map((spec) => found.get(spec.slug)).filter(
    (item): item is FoodItemPrice => item != null,
  );

  let basket = 0;
  for (const spec of STAPLE_SPECS) {
    const item = found.get(spec.slug);
    if (item) {
      basket += item.priceLkr * spec.basketQty;
    }
  }

  return {
    sourceId: SPAR_SOURCE_ID,
    sourceName: SPAR_SOURCE_NAME,
    asOf: asOf || new Date().toISOString(),
    essentialsBasketLkr: Math.round(basket),
    stapleItems,
    retailOffers: found.size,
    marketQuotes: products.length,
  };
}

async function fetchSparCatalog(): Promise<SparCatalog | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(SPAR_URL, {
      signal: controller.signal,
      next: { revalidate: 21_600 },
      headers: {
        Accept: "application/json",
        "User-Agent": "LankawaBot/1.0",
      },
    });

    // Rate-limited or any failure → optional bypass skips quietly.
    if (response.status === 429 || !response.ok) {
      return null;
    }

    return (await response.json()) as SparCatalog;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Fetch one page of SPAR2U products.json and map staples, or null on failure. */
export async function fetchSpar2uRetail(): Promise<SparRetailSnapshot | null> {
  const catalog = await fetchSparCatalog();
  if (!catalog) {
    return null;
  }
  return buildSparRetailSnapshot(catalog);
}
