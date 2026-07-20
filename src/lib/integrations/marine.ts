import { getDistrictCoords } from "@/lib/district-coords";
import { computeFreshnessTier } from "@/lib/freshness";
import type { FreshnessTier } from "@/lib/types";

const FETCH_TIMEOUT_MS = 10_000;

/** West / south / east coastal admin districts for marine swell card. */
export const COASTAL_DISTRICT_SLUGS = [
  "colombo",
  "gampaha",
  "kalutara",
  "galle",
  "matara",
  "hambantota",
  "jaffna",
  "kilinochchi",
  "mannar",
  "mullaitivu",
  "batticaloa",
  "ampara",
  "trincomalee",
  "puttalam",
] as const;

export type CoastalDistrictSlug = (typeof COASTAL_DISTRICT_SLUGS)[number];

export function isCoastalDistrict(slug: string): boolean {
  return (COASTAL_DISTRICT_SLUGS as readonly string[]).includes(slug);
}

export interface MarineSwellSnapshot {
  sourceId: string;
  sourceName: string;
  districtSlug: string;
  asOf: string;
  tier: FreshnessTier;
  isSeed: boolean;
  error: string | null;
  waveHeightM: number | null;
  wavePeriodS: number | null;
  waveDirectionDeg: number | null;
  honestyNote: string;
}

interface MarineApiResponse {
  hourly?: {
    time?: string[];
    wave_height?: Array<number | null>;
    wave_period?: Array<number | null>;
    wave_direction?: Array<number | null>;
  };
}

function seedSwell(districtSlug: string): MarineSwellSnapshot {
  const coords = getDistrictCoords(districtSlug);
  const hash = districtSlug.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const waveHeightM = 0.8 + (hash % 12) / 10;
  return {
    sourceId: "open_meteo_marine_seed",
    sourceName: "Open-Meteo Marine (seed scaffold)",
    districtSlug,
    asOf: new Date().toISOString(),
    tier: "stale",
    isSeed: true,
    error: null,
    waveHeightM: Math.round(waveHeightM * 10) / 10,
    wavePeriodS: 8 + (hash % 5),
    waveDirectionDeg: (coords.longitude * 10 + hash) % 360,
    honestyNote:
      "Seed scaffold when marine API is unavailable. Not a Met Dept marine warning.",
  };
}

function pickLatest(
  times: string[],
  values: Array<number | null | undefined>,
): { at: string; value: number } | null {
  for (let i = times.length - 1; i >= 0; i -= 1) {
    const value = values[i];
    if (value != null && Number.isFinite(value)) {
      return { at: times[i]!, value };
    }
  }
  return null;
}

export async function fetchMarineSwell(
  districtSlug: string,
): Promise<MarineSwellSnapshot> {
  if (!isCoastalDistrict(districtSlug)) {
    return {
      ...seedSwell(districtSlug),
      error: "Not a coastal district",
      waveHeightM: null,
      wavePeriodS: null,
      waveDirectionDeg: null,
    };
  }

  const { latitude, longitude } = getDistrictCoords(districtSlug);
  const url =
    `https://marine-api.open-meteo.com/v1/marine` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&hourly=wave_height,wave_period,wave_direction&forecast_days=1`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Open-Meteo Marine returned ${response.status}`);
    }
    const data = (await response.json()) as MarineApiResponse;
    const times = data.hourly?.time ?? [];
    const height = pickLatest(times, data.hourly?.wave_height ?? []);
    const period = pickLatest(times, data.hourly?.wave_period ?? []);
    const direction = pickLatest(times, data.hourly?.wave_direction ?? []);

    if (!height) {
      throw new Error("No wave_height in marine response");
    }

    const asOf = height.at.includes("T")
      ? `${height.at}:00.000Z`
      : new Date().toISOString();

    return {
      sourceId: "open_meteo_marine",
      sourceName: "Open-Meteo Marine",
      districtSlug,
      asOf,
      tier: computeFreshnessTier(asOf, 180),
      isSeed: false,
      error: null,
      waveHeightM: Math.round(height.value * 10) / 10,
      wavePeriodS: period ? Math.round(period.value * 10) / 10 : null,
      waveDirectionDeg: direction ? Math.round(direction.value) : null,
      honestyNote:
        "Open-Meteo marine model near district capital. Not a Met Dept or Navy warning.",
    };
  } catch {
    return seedSwell(districtSlug);
  } finally {
    clearTimeout(timeout);
  }
}
