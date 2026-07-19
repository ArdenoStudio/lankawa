import { computeFreshnessTier } from "../freshness";
import { getSource, getSourceProvenancePath } from "../sources";
import type { FreshnessTier } from "../types";

export const GDACS_SOURCE_ID = "gdacs";

/** Wider Indian Ocean / South Asia window so cyclones near Sri Lanka appear. */
const REGION = {
  minLon: 70,
  minLat: -5,
  maxLon: 95,
  maxLat: 25,
} as const;

const LOOKBACK_DAYS = 14;

export interface GdacsEvent {
  id: string;
  name: string;
  eventType: string;
  alertLevel: string;
  country: string | null;
  latitude: number;
  longitude: number;
  fromDate: string | null;
  toDate: string | null;
  reportUrl: string | null;
}

export interface GdacsSnapshot {
  sourceId: string;
  sourceName: string;
  events: GdacsEvent[];
  asOf: string;
  tier: FreshnessTier;
  error: string | null;
  provenancePath: string;
}

interface GdacsFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    eventtype?: string;
    eventid?: number;
    name?: string;
    description?: string;
    alertlevel?: string;
    country?: string;
    fromdate?: string;
    todate?: string;
    url?: { report?: string };
  };
}

function inRegion(lon: number, lat: number): boolean {
  return (
    lon >= REGION.minLon &&
    lon <= REGION.maxLon &&
    lat >= REGION.minLat &&
    lat <= REGION.maxLat
  );
}

function mentionsSriLanka(country: string | null | undefined): boolean {
  if (!country) {
    return false;
  }
  return /sri\s*lanka/i.test(country);
}

export async function fetchGdacsSnapshot(): Promise<GdacsSnapshot> {
  const source = getSource(GDACS_SOURCE_ID)!;
  const asOf = new Date().toISOString();
  const provenancePath = getSourceProvenancePath(source.id);
  const from = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const to = new Date().toISOString().slice(0, 10);
  const url =
    `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH` +
    `?fromdatetime=${from}&todatetime=${to}` +
    `&alertlevel=Green;Orange;Red&eventlist=TC;FL;EQ;DR;WF`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 1800 },
      headers: { Accept: "application/geo+json, application/json" },
    });

    if (!response.ok) {
      throw new Error(`GDACS returned ${response.status}`);
    }

    const payload = (await response.json()) as { features?: GdacsFeature[] };
    const events = (payload.features ?? [])
      .map((feature): GdacsEvent | null => {
        const coords = feature.geometry?.coordinates;
        const props = feature.properties;
        if (!coords || coords.length < 2 || !props) {
          return null;
        }
        const [longitude, latitude] = coords;
        const country = props.country ?? null;
        if (!inRegion(longitude, latitude) && !mentionsSriLanka(country)) {
          return null;
        }

        return {
          id: `${props.eventtype ?? "X"}-${props.eventid ?? `${longitude}-${latitude}`}`,
          name: props.name?.trim() || props.description?.trim() || "GDACS event",
          eventType: props.eventtype ?? "?",
          alertLevel: props.alertlevel ?? "Green",
          country,
          latitude,
          longitude,
          fromDate: props.fromdate ?? null,
          toDate: props.todate ?? null,
          reportUrl: props.url?.report ?? null,
        };
      })
      .filter((event): event is GdacsEvent => event != null)
      .sort((a, b) => {
        const rank = (level: string) =>
          level === "Red" ? 0 : level === "Orange" ? 1 : 2;
        return rank(a.alertLevel) - rank(b.alertLevel);
      })
      .slice(0, 20);

    const orangeOrWorse = events.filter((event) =>
      ["Orange", "Red"].includes(event.alertLevel),
    );
    const tier = computeFreshnessTier(asOf, source.cadenceMinutes);

    return {
      sourceId: source.id,
      sourceName: source.name,
      events: orangeOrWorse.length > 0 ? orangeOrWorse : events.slice(0, 8),
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
      asOf,
      tier: "down",
      error: error instanceof Error ? error.message : "Unknown error",
      provenancePath,
    };
  }
}
