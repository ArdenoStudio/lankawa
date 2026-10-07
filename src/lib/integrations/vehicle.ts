import { DISTRICTS } from "@/lib/districts";
import { getVehicleSnapshot } from "@/lib/vehicle";
import type {
  VehicleDistrictPrice,
  VehicleMakeStat,
  VehicleSnapshot,
} from "@/lib/types";

const VEHICLE_API_BASE =
  process.env.VEHICLE_API_BASE ??
  "https://vehicle-platform-backend.fly.dev/api/v1";

const FETCH_TIMEOUT_MS = 8000;

interface VehicleStatsSummary {
  total_listings: number;
  avg_price_lkr: number;
  good_deals_count: number;
  source_count: number;
  last_updated: string;
}

interface VehicleDistrictPoint {
  district: string;
  count: number;
  avg_price_lkr: number;
  median_price_lkr: number;
  top_make: string;
  top_model: string;
}

interface VehicleMakeRow {
  make: string;
  count: number;
}

function resolveDistrictSlug(name: string): string | null {
  const trimmed = (name ?? "").trim();
  if (!trimmed || trimmed === "Sri Lanka") {
    return null;
  }
  const slug = trimmed.toLowerCase().replace(/\s+/g, "-");
  if (DISTRICTS.some((district) => district.slug === slug)) {
    return slug;
  }
  const match = DISTRICTS.find(
    (district) => district.name.toLowerCase() === trimmed.toLowerCase(),
  );
  return match?.slug ?? null;
}

function mapDistrictPoint(point: VehicleDistrictPoint): VehicleDistrictPrice | null {
  const slug = resolveDistrictSlug(point.district);
  if (!slug) {
    return null;
  }
  return {
    slug,
    districtName: point.district.trim(),
    listingCount: point.count,
    medianPriceLkr: Math.round(point.median_price_lkr),
    avgPriceLkr: Math.round(point.avg_price_lkr),
    topMake: point.top_make,
    topModel: point.top_model,
  };
}

/**
 * The upstream district feed occasionally returns two rows for the same
 * district (case/whitespace variants that resolve to one slug). Merge them so
 * each district appears exactly once: listing counts sum, prices are
 * listing-weighted, and labels come from the largest row.
 */
function dedupeDistrictPrices(
  points: VehicleDistrictPrice[],
): VehicleDistrictPrice[] {
  const bySlug = new Map<string, VehicleDistrictPrice[]>();
  for (const point of points) {
    const group = bySlug.get(point.slug);
    if (group) {
      group.push(point);
    } else {
      bySlug.set(point.slug, [point]);
    }
  }

  const merged: VehicleDistrictPrice[] = [];
  for (const group of bySlug.values()) {
    if (group.length === 1) {
      merged.push(group[0]);
      continue;
    }
    const total = group.reduce((sum, item) => sum + item.listingCount, 0);
    const biggest = [...group].sort(
      (a, b) => b.listingCount - a.listingCount,
    )[0];
    const weighted = (pick: (item: VehicleDistrictPrice) => number) =>
      total > 0
        ? Math.round(
            group.reduce((sum, item) => sum + pick(item) * item.listingCount, 0) /
              total,
          )
        : Math.round(
            group.reduce((sum, item) => sum + pick(item), 0) / group.length,
          );
    merged.push({
      slug: biggest.slug,
      districtName: biggest.districtName,
      listingCount: total,
      medianPriceLkr: weighted((item) => item.medianPriceLkr),
      avgPriceLkr: weighted((item) => item.avgPriceLkr),
      topMake: biggest.topMake,
      topModel: biggest.topModel,
    });
  }
  return merged;
}

async function fetchJson<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${VEHICLE_API_BASE}${path}`, {
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

export async function fetchVehicleSnapshot(): Promise<VehicleSnapshot | null> {
  const [summary, districtPrices, makes] = await Promise.all([
    fetchJson<VehicleStatsSummary>("/stats/summary"),
    fetchJson<{ points: VehicleDistrictPoint[] }>("/stats/district-prices"),
    fetchJson<VehicleMakeRow[]>("/listings/makes"),
  ]);

  if (!summary || !districtPrices?.points?.length) {
    return null;
  }

  const districts = dedupeDistrictPrices(
    districtPrices.points
      .map(mapDistrictPoint)
      .filter((point): point is VehicleDistrictPrice => point != null),
  ).sort((a, b) => b.listingCount - a.listingCount);

  if (districts.length === 0) {
    return null;
  }

  const popularMakes: VehicleMakeStat[] = (makes ?? [])
    .slice(0, 8)
    .map((row) => ({ make: row.make, count: row.count }));

  return {
    ...getVehicleSnapshot(),
    sourceId: "vehicle_platform_api",
    sourceName: "AutoLens LK Vehicle Intelligence",
    asOf: summary.last_updated,
    totalListings: summary.total_listings,
    avgPriceLkr: Math.round(summary.avg_price_lkr),
    goodDealsCount: summary.good_deals_count,
    sourceCount: summary.source_count,
    popularMakes:
      popularMakes.length > 0 ? popularMakes : getVehicleSnapshot().popularMakes,
    districts,
  };
}

export async function getVehicleData(): Promise<VehicleSnapshot> {
  const live = await fetchVehicleSnapshot();
  return live ?? getVehicleSnapshot();
}
