import { getSource } from "../sources";

export const NOMINATIM_OSM_SOURCE_ID = "nominatim_osm" as const;

const REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const USER_AGENT =
  "LankawaBot/1.0 (civic@lankawa.app; +https://github.com/ArdenoStudio/lankawa)";
const FETCH_TIMEOUT_MS = 8_000;

export type ReverseGeocodeResult = {
  displayName: string;
  lat: number;
  lon: number;
};

type NominatimReversePayload = {
  display_name?: string;
  error?: string;
  lat?: string;
  lon?: string;
};

function buildTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal === "undefined" || !("timeout" in AbortSignal)) {
    return undefined;
  }
  return (
    AbortSignal as typeof AbortSignal & { timeout(ms: number): AbortSignal }
  ).timeout(timeoutMs);
}

/** Sync approx label — never calls Nominatim. */
export function formatApproxPlace(lat: number, lon: number): string {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return "—, —";
  }
  return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
}

export function parseNominatimReverse(
  payload: NominatimReversePayload | null | undefined,
  lat: number,
  lon: number,
): ReverseGeocodeResult | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  if (typeof payload.error === "string" && payload.error.length > 0) {
    return null;
  }
  const displayName =
    typeof payload.display_name === "string"
      ? payload.display_name.trim()
      : "";
  if (!displayName) {
    return null;
  }
  return {
    displayName,
    lat,
    lon,
  };
}

/**
 * Reverse-geocode a single focus pin. Call sparingly — Nominatim ToS
 * expects ~1 req/s; Lankawa rate-limits the public reverse API to 10/min.
 */
export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<ReverseGeocodeResult | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }

  getSource(NOMINATIM_OSM_SOURCE_ID);

  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      format: "json",
      zoom: "12",
      addressdetails: "0",
    });
    const response = await fetch(`${REVERSE_URL}?${params.toString()}`, {
      signal: buildTimeoutSignal(FETCH_TIMEOUT_MS),
      next: { revalidate: 86400 },
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
    });
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as NominatimReversePayload;
    return parseNominatimReverse(payload, lat, lon);
  } catch {
    return null;
  }
}
