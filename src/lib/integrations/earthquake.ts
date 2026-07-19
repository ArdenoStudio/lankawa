import { computeFreshnessTier } from "../freshness";
import { getSource, getSourceProvenancePath } from "../sources";
import type { FreshnessTier } from "../types";

const USGS_EVENT_API = "https://earthquake.usgs.gov/fdsnws/event/1/query";
export const USGS_EARTHQUAKE_SOURCE_ID = "usgs_earthquake";

/** Sri Lanka land bounding box — matches `DistrictMap` bounds. */
export const SRI_LANKA_EARTHQUAKE_BBOX = {
  minLon: 79.5,
  minLat: 5.9,
  maxLon: 82.1,
  maxLat: 9.9,
} as const;

const QUERY_WINDOW_DAYS = 30;
const MIN_MAGNITUDE = 2.5;
const EVENT_LIMIT = 20;

export interface EarthquakeEvent {
  id: string;
  magnitude: number | null;
  magnitudeType: string | null;
  place: string;
  depthKm: number | null;
  latitude: number;
  longitude: number;
  occurredAt: string;
  usgsUrl: string | null;
  tsunamiFlag: number | null;
}

export interface EarthquakeSnapshot {
  sourceId: string;
  sourceName: string;
  events: EarthquakeEvent[];
  queryWindowDays: number;
  minMagnitude: number;
  bbox: typeof SRI_LANKA_EARTHQUAKE_BBOX;
  asOf: string;
  tier: FreshnessTier;
  error: string | null;
  provenancePath: string;
}

interface UsgsGeoJsonFeature {
  id?: string;
  geometry?: {
    type?: string;
    coordinates?: [number, number, number];
  };
  properties?: {
    mag?: number | null;
    magType?: string | null;
    place?: string | null;
    time?: number;
    url?: string | null;
    tsunami?: number | null;
  };
}

interface UsgsGeoJsonResponse {
  features?: UsgsGeoJsonFeature[];
}

function buildUsgsQueryUrl(): string {
  const start = new Date(Date.now() - QUERY_WINDOW_DAYS * 86_400_000);
  const params = new URLSearchParams({
    format: "geojson",
    starttime: start.toISOString().slice(0, 10),
    minlatitude: String(SRI_LANKA_EARTHQUAKE_BBOX.minLat),
    maxlatitude: String(SRI_LANKA_EARTHQUAKE_BBOX.maxLat),
    minlongitude: String(SRI_LANKA_EARTHQUAKE_BBOX.minLon),
    maxlongitude: String(SRI_LANKA_EARTHQUAKE_BBOX.maxLon),
    minmagnitude: String(MIN_MAGNITUDE),
    orderby: "time",
    limit: String(EVENT_LIMIT),
  });

  return `${USGS_EVENT_API}?${params.toString()}`;
}

function parseUsgsFeature(feature: UsgsGeoJsonFeature): EarthquakeEvent | null {
  const coordinates = feature.geometry?.coordinates;
  const properties = feature.properties;

  if (!coordinates || coordinates.length < 2 || !properties?.time) {
    return null;
  }

  const [longitude, latitude, depthKm = null] = coordinates;

  if (
    longitude < SRI_LANKA_EARTHQUAKE_BBOX.minLon ||
    longitude > SRI_LANKA_EARTHQUAKE_BBOX.maxLon ||
    latitude < SRI_LANKA_EARTHQUAKE_BBOX.minLat ||
    latitude > SRI_LANKA_EARTHQUAKE_BBOX.maxLat
  ) {
    return null;
  }

  return {
    id: feature.id ?? `${properties.time}-${latitude}-${longitude}`,
    magnitude: properties.mag ?? null,
    magnitudeType: properties.magType ?? null,
    place: properties.place?.trim() || "Unknown location",
    depthKm,
    latitude,
    longitude,
    occurredAt: new Date(properties.time).toISOString(),
    usgsUrl: properties.url ?? null,
    tsunamiFlag: properties.tsunami ?? null,
  };
}

export async function fetchEarthquakeSnapshot(): Promise<EarthquakeSnapshot> {
  const source = getSource(USGS_EARTHQUAKE_SOURCE_ID)!;
  const asOf = new Date().toISOString();
  const provenancePath = getSourceProvenancePath(source.id);

  try {
    const response = await fetch(buildUsgsQueryUrl(), {
      next: { revalidate: 1800 },
      headers: { Accept: "application/geo+json, application/json" },
    });

    if (!response.ok) {
      throw new Error(`USGS Event API returned ${response.status}`);
    }

    const payload = (await response.json()) as UsgsGeoJsonResponse;
    const events = (payload.features ?? [])
      .map(parseUsgsFeature)
      .filter((event): event is EarthquakeEvent => event != null)
      .sort(
        (left, right) =>
          new Date(right.occurredAt).getTime() -
          new Date(left.occurredAt).getTime(),
      );

    const latestObservedAt = events[0]?.occurredAt ?? asOf;
    const tier = computeFreshnessTier(latestObservedAt, source.cadenceMinutes);

    return {
      sourceId: source.id,
      sourceName: source.name,
      events,
      queryWindowDays: QUERY_WINDOW_DAYS,
      minMagnitude: MIN_MAGNITUDE,
      bbox: SRI_LANKA_EARTHQUAKE_BBOX,
      asOf,
      tier,
      error: null,
      provenancePath,
    };
  } catch (error) {
    return {
      sourceId: source.id,
      sourceName: source.name,
      events: [],
      queryWindowDays: QUERY_WINDOW_DAYS,
      minMagnitude: MIN_MAGNITUDE,
      bbox: SRI_LANKA_EARTHQUAKE_BBOX,
      asOf,
      tier: "down",
      error: error instanceof Error ? error.message : "Unknown error",
      provenancePath,
    };
  }
}
