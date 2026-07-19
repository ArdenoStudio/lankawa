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
  if (!name || name === "Sri Lanka") {
    return null;
  }
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  if (DISTRICTS.some((district) => district.slug === slug)) {
    return slug;
  }
  const match = DISTRICTS.find(
    (district) => district.name.toLowerCase() === name.toLowerCase(),
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
    districtName: point.district,
    listingCount: point.count,
    medianPriceLkr: Math.round(point.median_price_lkr),
    avgPriceLkr: Math.round(point.avg_price_lkr),
    topMake: point.top_make,
    topModel: point.top_model,
  };
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

  const districts = districtPrices.points
    .map(mapDistrictPoint)
    .filter((point): point is VehicleDistrictPrice => point != null)
    .sort((a, b) => b.listingCount - a.listingCount);

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
