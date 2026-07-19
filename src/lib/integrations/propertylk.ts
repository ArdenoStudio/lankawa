import { DISTRICTS } from "@/lib/districts";
import { getPropertySnapshot } from "@/lib/property";
import type { PropertyDistrictPrice, PropertySnapshot } from "@/lib/types";

const PROPERTYLK_BASE_URL =
  process.env.PROPERTYLK_API_URL ??
  "https://property-price-intelligence-an-ardeno-production.fly.dev";

const FETCH_TIMEOUT_MS = 12_000;

interface PropertyLkDistrictRow {
  district: string;
  count: number;
  avg_price: number | null;
}

function resolveDistrictSlug(name: string): string | null {
  const normalized = name.trim().toLowerCase();
  if (normalized === "moneragala") {
    return "monaragala";
  }

  const slug = normalized.replace(/\s+/g, "-");
  if (DISTRICTS.some((district) => district.slug === slug)) {
    return slug;
  }

  const byName = DISTRICTS.find(
    (district) => district.name.toLowerCase() === normalized,
  );
  return byName?.slug ?? null;
}

function mapDistrictRow(
  row: PropertyLkDistrictRow,
  seedBySlug: Map<string, PropertyDistrictPrice>,
): PropertyDistrictPrice | null {
  const slug = resolveDistrictSlug(row.district);
  if (!slug || row.avg_price == null || row.avg_price <= 0) {
    return null;
  }

  const seed = seedBySlug.get(slug);
  const median = Math.round(row.avg_price);

  return {
    slug,
    medianPerPerch: median,
    lowBand: seed?.lowBand ?? Math.round(median * 0.55),
    highBand: seed?.highBand ?? Math.round(median * 1.85),
    medianPerSqFt: seed?.medianPerSqFt ?? Math.round(median / 272.25),
    trendPct: seed?.trendPct ?? 0,
  };
}

export async function fetchPropertySnapshot(): Promise<PropertySnapshot | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${PROPERTYLK_BASE_URL}/districts`, {
      signal: controller.signal,
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    const rows = (await response.json()) as PropertyLkDistrictRow[];
    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const seed = getPropertySnapshot();
    const seedBySlug = new Map(seed.districts.map((district) => [district.slug, district]));
    const districts = rows
      .map((row) => mapDistrictRow(row, seedBySlug))
      .filter((district): district is PropertyDistrictPrice => district != null);

    if (districts.length === 0) {
      return null;
    }

    return {
      ...seed,
      districts,
      sourceId: "propertylk_api",
      sourceName: "PropertyLK Price Intelligence",
      asOf: new Date().toISOString().slice(0, 10),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getPropertyData(): Promise<PropertySnapshot> {
  const live = await fetchPropertySnapshot();
  return live ?? getPropertySnapshot();
}
