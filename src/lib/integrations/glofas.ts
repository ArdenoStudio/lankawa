import { getDistrictCoords } from "@/lib/district-coords";
import { computeFreshnessTier } from "@/lib/freshness";
import type { TimeValue } from "@/lib/charts/mono";
import type { FreshnessTier } from "@/lib/types";

const FETCH_TIMEOUT_MS = 12_000;
const BASIN_POINTS = [
  { id: "kelani", label: "Kelani basin (Colombo)", districtSlug: "colombo" },
  { id: "maha", label: "Mahaweli corridor (Kandy)", districtSlug: "kandy" },
  { id: "kalu", label: "Kalu basin (Kalutara)", districtSlug: "kalutara" },
] as const;

export interface GlofasBasinPoint {
  id: string;
  label: string;
  districtSlug: string;
  latitude: number;
  longitude: number;
  latestDischargeM3s: number | null;
  series: TimeValue[];
}

export interface GlofasBasinSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  tier: FreshnessTier;
  isSeed: boolean;
  error: string | null;
  basins: GlofasBasinPoint[];
  honestyNote: string;
}

interface FloodApiResponse {
  daily?: {
    time?: string[];
    river_discharge?: Array<number | null>;
  };
}

async function fetchBasinDischarge(
  latitude: number,
  longitude: number,
): Promise<TimeValue[]> {
  const url =
    `https://flood-api.open-meteo.com/v1/flood` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&daily=river_discharge&forecast_days=7&past_days=7`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Open-Meteo Flood returned ${response.status}`);
    }
    const data = (await response.json()) as FloodApiResponse;
    const times = data.daily?.time ?? [];
    const values = data.daily?.river_discharge ?? [];
    return times
      .map((date, index) => {
        const value = values[index];
        if (value == null || !Number.isFinite(value)) {
          return null;
        }
        return { date, value };
      })
      .filter((point): point is TimeValue => point != null);
  } finally {
    clearTimeout(timeout);
  }
}

function seedBasins(): GlofasBasinPoint[] {
  return BASIN_POINTS.map((basin, index) => {
    const coords = getDistrictCoords(basin.districtSlug);
    const base = 120 + index * 40;
    const series: TimeValue[] = Array.from({ length: 8 }, (_, day) => ({
      date: new Date(Date.now() - (7 - day) * 86_400_000)
        .toISOString()
        .slice(0, 10),
      value: base + Math.round(Math.sin(day / 2) * 12),
    }));
    return {
      id: basin.id,
      label: basin.label,
      districtSlug: basin.districtSlug,
      latitude: coords.latitude,
      longitude: coords.longitude,
      latestDischargeM3s: series[series.length - 1]?.value ?? null,
      series,
    };
  });
}

export async function fetchGlofasBasinSnapshot(): Promise<GlofasBasinSnapshot> {
  const honestyNote =
    "Open-Meteo Flood / GloFAS simulated discharge (m³/s) near basin centroids. Complements local river gauges — not an official DMC flood warning.";

  try {
    const basins = await Promise.all(
      BASIN_POINTS.map(async (basin) => {
        const coords = getDistrictCoords(basin.districtSlug);
        const series = await fetchBasinDischarge(
          coords.latitude,
          coords.longitude,
        );
        return {
          id: basin.id,
          label: basin.label,
          districtSlug: basin.districtSlug,
          latitude: coords.latitude,
          longitude: coords.longitude,
          latestDischargeM3s: series[series.length - 1]?.value ?? null,
          series,
        } satisfies GlofasBasinPoint;
      }),
    );

    const usable = basins.filter((basin) => basin.series.length >= 2);
    if (usable.length === 0) {
      throw new Error("No GloFAS discharge series returned");
    }

    const asOf = new Date().toISOString();
    return {
      sourceId: "open_meteo_flood",
      sourceName: "Open-Meteo Flood (GloFAS)",
      asOf,
      tier: computeFreshnessTier(asOf, 360),
      isSeed: false,
      error: null,
      basins: usable,
      honestyNote,
    };
  } catch (error) {
    const asOf = new Date().toISOString();
    return {
      sourceId: "open_meteo_flood_seed",
      sourceName: "Open-Meteo Flood (GloFAS) — seed scaffold",
      asOf,
      tier: "stale",
      isSeed: true,
      error: error instanceof Error ? error.message : "Unknown error",
      basins: seedBasins(),
      honestyNote,
    };
  }
}
