import { getDistrictForFloodStation } from "../flood-districts";
import type { FloodAlertSummary, FloodStationLevel } from "../types";
import {
  fetchIrrigationGaugesSnapshot,
  toFloodStationLevel,
  type IrrigationGaugesSnapshot,
} from "./irrigation-gauges";

const FLOOD_API_BASE =
  process.env.FLOOD_API_BASE ?? "https://lk-flood-api.vercel.app";

/** Match history canary + WEATHER_DISASTER_APIS_RESEARCH.md (>6 h → prefer Irrigation). */
export const FLOOD_LEVELS_STALE_MS = 6 * 60 * 60 * 1000;

export async function fetchFloodAlertSummary(): Promise<FloodAlertSummary[]> {
  const response = await fetch(`${FLOOD_API_BASE}/alerts/summary`, {
    next: { revalidate: 600 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Flood API returned ${response.status}`);
  }

  const raw = (await response.json()) as Array<{
    alert_level?: string;
    alertLevel?: string;
    count: number;
    stations: string[];
  }>;

  return raw.map((item) => ({
    alertLevel: item.alertLevel ?? item.alert_level ?? "UNKNOWN",
    count: item.count,
    stations: item.stations,
  }));
}

export async function fetchFloodHealth(): Promise<{ status: string }> {
  const response = await fetch(`${FLOOD_API_BASE}/health`, {
    next: { revalidate: 300 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Flood API health returned ${response.status}`);
  }

  return response.json() as Promise<{ status: string }>;
}

export function areFloodLevelsStale(
  levels: FloodStationLevel[],
  now = Date.now(),
): boolean {
  if (levels.length === 0) {
    return true;
  }

  let newestMs = Number.NEGATIVE_INFINITY;
  let hasValidTimestamp = false;

  for (const level of levels) {
    if (!level.timestamp) {
      continue;
    }
    const ms = new Date(level.timestamp).getTime();
    if (Number.isNaN(ms)) {
      continue;
    }
    hasValidTimestamp = true;
    if (ms > newestMs) {
      newestMs = ms;
    }
  }

  if (!hasValidTimestamp) {
    return true;
  }

  return now - newestMs > FLOOD_LEVELS_STALE_MS;
}

/**
 * Prefer live Irrigation ArcGIS gauges when lk-flood-api levels are missing/stale.
 * Keeps lk-flood-api rows when Irrigation is seed/empty so UI never gets worse.
 */
export function preferIrrigationWhenFloodStale(
  floodLevels: FloodStationLevel[],
  irrigation: Pick<IrrigationGaugesSnapshot, "isSeed" | "gauges">,
  now = Date.now(),
): FloodStationLevel[] {
  if (!areFloodLevelsStale(floodLevels, now)) {
    return floodLevels;
  }
  if (irrigation.isSeed || irrigation.gauges.length === 0) {
    return floodLevels;
  }
  return irrigation.gauges.map(toFloodStationLevel);
}

async function fetchLatestFloodLevelsFromApi(): Promise<FloodStationLevel[]> {
  const response = await fetch(`${FLOOD_API_BASE}/levels/latest`, {
    next: { revalidate: 600 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Flood API levels returned ${response.status}`);
  }

  const raw = (await response.json()) as Array<{
    station_name?: string;
    stationName?: string;
    river_name?: string;
    riverName?: string;
    water_level?: number;
    waterLevel?: number;
    alert_status?: string;
    alertStatus?: string;
    remarks?: string;
    timestamp?: string;
  }>;

  return raw.map((item) => ({
    stationName: item.stationName ?? item.station_name ?? "Unknown",
    riverName: item.riverName ?? item.river_name ?? "",
    waterLevel: item.waterLevel ?? item.water_level ?? 0,
    alertStatus: item.alertStatus ?? item.alert_status ?? "UNKNOWN",
    remarks: item.remarks ?? "",
    timestamp: item.timestamp ?? "",
  }));
}

export async function fetchLatestFloodLevels(): Promise<FloodStationLevel[]> {
  let floodLevels: FloodStationLevel[] = [];
  let apiError: Error | null = null;

  try {
    floodLevels = await fetchLatestFloodLevelsFromApi();
  } catch (error) {
    apiError =
      error instanceof Error
        ? error
        : new Error("Flood API levels fetch failed");
  }

  if (!apiError && !areFloodLevelsStale(floodLevels)) {
    return floodLevels;
  }

  try {
    const irrigation = await fetchIrrigationGaugesSnapshot();
    const preferred = preferIrrigationWhenFloodStale(floodLevels, irrigation);
    if (preferred !== floodLevels) {
      return preferred;
    }
  } catch {
    // Keep lk-flood-api rows (or surface the original API error below).
  }

  if (apiError) {
    throw apiError;
  }

  return floodLevels;
}

export async function fetchFloodLevelsForDistrict(
  districtSlug: string,
): Promise<FloodStationLevel[]> {
  const levels = await fetchLatestFloodLevels();
  return levels.filter(
    (level) => getDistrictForFloodStation(level.stationName) === districtSlug,
  );
}

export interface FloodHistoryPoint {
  timestamp: string;
  waterLevel: number;
}

export async function fetchFloodLevelHistory(
  stationName: string,
  limit = 24,
): Promise<{ points: FloodHistoryPoint[]; tier: "fresh" | "stale" | "down" }> {
  const response = await fetch(
    `${FLOOD_API_BASE}/levels/history/${encodeURIComponent(stationName)}?limit=${limit}`,
    {
      next: { revalidate: 600 },
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(`Flood history returned ${response.status}`);
  }

  const raw = (await response.json()) as Array<{
    timestamp?: string;
    water_level?: number;
    waterLevel?: number;
  }>;

  const points = raw
    .map((item) => ({
      timestamp: item.timestamp ?? "",
      waterLevel: item.waterLevel ?? item.water_level ?? 0,
    }))
    .reverse();

  const latest = points[points.length - 1]?.timestamp;
  let tier: "fresh" | "stale" | "down" = "fresh";
  if (latest) {
    const ageMs = Date.now() - new Date(latest).getTime();
    if (ageMs > FLOOD_LEVELS_STALE_MS) {
      tier = "stale";
    }
  } else {
    tier = "down";
  }

  return { points, tier };
}
