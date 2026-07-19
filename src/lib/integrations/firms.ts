import { computeFreshnessTier } from "../freshness";
import { getSource, getSourceProvenancePath } from "../sources";
import type { FreshnessTier } from "../types";
import { SRI_LANKA_EARTHQUAKE_BBOX } from "./earthquake";

export const FIRMS_SOURCE_ID = "nasa_firms";

const DAY_RANGE = 2;
const MAX_FIRES = 40;

export interface FirePin {
  id: string;
  latitude: number;
  longitude: number;
  brightness: number | null;
  confidence: string | null;
  acqDate: string;
  satellite: string | null;
}

export interface FirmsSnapshot {
  sourceId: string;
  sourceName: string;
  fires: FirePin[];
  dayRange: number;
  asOf: string;
  tier: FreshnessTier;
  error: string | null;
  needsApiKey: boolean;
  provenancePath: string;
}

function parseCsv(text: string): FirePin[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const latIdx = headers.indexOf("latitude");
  const lonIdx = headers.indexOf("longitude");
  const brightIdx = headers.findIndex((h) => h.includes("bright"));
  const confIdx = headers.indexOf("confidence");
  const dateIdx = headers.indexOf("acq_date");
  const timeIdx = headers.indexOf("acq_time");
  const satIdx = headers.indexOf("satellite");

  if (latIdx < 0 || lonIdx < 0) {
    return [];
  }

  const fires: FirePin[] = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(",");
    const latitude = Number(cols[latIdx]);
    const longitude = Number(cols[lonIdx]);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      continue;
    }
    if (
      longitude < SRI_LANKA_EARTHQUAKE_BBOX.minLon ||
      longitude > SRI_LANKA_EARTHQUAKE_BBOX.maxLon ||
      latitude < SRI_LANKA_EARTHQUAKE_BBOX.minLat ||
      latitude > SRI_LANKA_EARTHQUAKE_BBOX.maxLat
    ) {
      continue;
    }

    const acqDate = cols[dateIdx] ?? "";
    const acqTime = cols[timeIdx] ?? "0000";
    const iso =
      acqDate.length >= 10
        ? `${acqDate}T${acqTime.padStart(4, "0").slice(0, 2)}:${acqTime.padStart(4, "0").slice(2, 4)}:00Z`
        : new Date().toISOString();

    fires.push({
      id: `${latitude.toFixed(4)}-${longitude.toFixed(4)}-${acqDate}-${acqTime}`,
      latitude,
      longitude,
      brightness: brightIdx >= 0 ? Number(cols[brightIdx]) || null : null,
      confidence: confIdx >= 0 ? cols[confIdx] || null : null,
      acqDate: iso,
      satellite: satIdx >= 0 ? cols[satIdx] || null : null,
    });
  }

  return fires
    .sort(
      (a, b) =>
        new Date(b.acqDate).getTime() - new Date(a.acqDate).getTime(),
    )
    .slice(0, MAX_FIRES);
}

export async function fetchFirmsSnapshot(): Promise<FirmsSnapshot> {
  const source = getSource(FIRMS_SOURCE_ID)!;
  const asOf = new Date().toISOString();
  const provenancePath = getSourceProvenancePath(source.id);
  const mapKey = process.env.NASA_FIRMS_MAP_KEY?.trim();

  if (!mapKey) {
    return {
      sourceId: source.id,
      sourceName: source.name,
      fires: [],
      dayRange: DAY_RANGE,
      asOf,
      tier: "stale",
      error: null,
      needsApiKey: true,
      provenancePath,
    };
  }

  const bbox = `${SRI_LANKA_EARTHQUAKE_BBOX.minLon},${SRI_LANKA_EARTHQUAKE_BBOX.minLat},${SRI_LANKA_EARTHQUAKE_BBOX.maxLon},${SRI_LANKA_EARTHQUAKE_BBOX.maxLat}`;
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_SNPP_NRT/${bbox}/${DAY_RANGE}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 1800 },
      headers: { Accept: "text/csv,text/plain,*/*" },
    });

    if (!response.ok) {
      throw new Error(`FIRMS returned ${response.status}`);
    }

    const text = await response.text();
    if (text.toLowerCase().includes("invalid") || text.startsWith("{")) {
      throw new Error("FIRMS rejected MAP_KEY or returned an error payload");
    }

    const fires = parseCsv(text);
    const latest = fires[0]?.acqDate ?? asOf;

    return {
      sourceId: source.id,
      sourceName: source.name,
      fires,
      dayRange: DAY_RANGE,
      asOf,
      tier: computeFreshnessTier(latest, source.cadenceMinutes),
      error: null,
      needsApiKey: false,
      provenancePath,
    };
  } catch (error) {
    return {
      sourceId: source.id,
      sourceName: source.name,
      fires: [],
      dayRange: DAY_RANGE,
      asOf,
      tier: "down",
      error: error instanceof Error ? error.message : "Unknown error",
      needsApiKey: false,
      provenancePath,
    };
  }
}
