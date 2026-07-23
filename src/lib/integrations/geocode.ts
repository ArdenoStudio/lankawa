import { districtSlugFromName } from "../district-geo";
import { DISTRICTS } from "../districts";
import { getSource } from "../sources";

export const OPEN_METEO_GEOCODING_SOURCE_ID = "open_meteo_geocoding" as const;

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const USER_AGENT = "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)";
const FETCH_TIMEOUT_MS = 8_000;

export type GeocodeHit = {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  admin2?: string;
  countryCode: string;
  districtSlug: string | null;
};

type OpenMeteoResult = {
  name?: string;
  latitude?: number;
  longitude?: number;
  admin1?: string;
  admin2?: string;
  country_code?: string;
};

function buildTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal === "undefined" || !("timeout" in AbortSignal)) {
    return undefined;
  }
  return (
    AbortSignal as typeof AbortSignal & { timeout(ms: number): AbortSignal }
  ).timeout(timeoutMs);
}

/** Map an Open-Meteo place name / admin2 to a Lankawa district slug. */
export function mapPlaceToDistrictSlug(
  admin2?: string,
  name?: string,
): string | null {
  const candidates = [admin2, name].filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );

  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase().trim();
    const byName = DISTRICTS.find(
      (district) =>
        district.name.toLowerCase() === normalized ||
        district.slug === normalized.replace(/\s+/g, "-") ||
        district.nameSi === candidate ||
        district.nameTa === candidate,
    );
    if (byName) {
      return byName.slug;
    }

    const fromHelper = districtSlugFromName(candidate);
    if (fromHelper && DISTRICTS.some((district) => district.slug === fromHelper)) {
      return fromHelper;
    }
  }

  return null;
}

export function parseGeocodeResults(
  results: OpenMeteoResult[] | undefined,
): GeocodeHit[] {
  if (!results?.length) {
    return [];
  }

  return results
    .map((row): GeocodeHit | null => {
      if (
        typeof row.name !== "string" ||
        typeof row.latitude !== "number" ||
        typeof row.longitude !== "number" ||
        !Number.isFinite(row.latitude) ||
        !Number.isFinite(row.longitude)
      ) {
        return null;
      }
      const countryCode = (row.country_code ?? "LK").toUpperCase();
      if (countryCode !== "LK") {
        return null;
      }
      return {
        name: row.name,
        latitude: row.latitude,
        longitude: row.longitude,
        admin1: row.admin1,
        admin2: row.admin2,
        countryCode,
        districtSlug: mapPlaceToDistrictSlug(row.admin2, row.name),
      };
    })
    .filter((hit): hit is GeocodeHit => hit != null);
}

export async function searchSriLankaPlaces(
  query: string,
): Promise<GeocodeHit[]> {
  const q = query.trim();
  if (!q || q.length < 2) {
    return [];
  }

  // Ensure source is registered (fail soft if catalog incomplete).
  getSource(OPEN_METEO_GEOCODING_SOURCE_ID);

  try {
    const params = new URLSearchParams({
      name: q,
      count: "5",
      language: "en",
      format: "json",
      countryCode: "LK",
    });
    const response = await fetch(`${GEOCODE_URL}?${params.toString()}`, {
      signal: buildTimeoutSignal(FETCH_TIMEOUT_MS),
      next: { revalidate: 86400 },
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
    });
    if (!response.ok) {
      return [];
    }
    const payload = (await response.json()) as { results?: OpenMeteoResult[] };
    return parseGeocodeResults(payload.results);
  } catch {
    return [];
  }
}
