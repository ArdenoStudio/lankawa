import districtSeedData from "../../data/districts.json" with { type: "json" };

export const SLCITIES_API_SOURCE_ID = "slcities_api" as const;
export const SLCITIES_SEED_SOURCE_ID = "slcities_seed" as const;

export const SEED_FALLBACK_DISCLAIMER = "Seed fallback — live API unavailable";

const PRIMARY_API_URL = "https://slcities.live/api";
const SECONDARY_API_URL = "https://locatesrilanka.herokuapp.com";
const FETCH_TIMEOUT_MS = 10_000;
const REVALIDATE_SECONDS = 86400;

export interface CityHit {
  name: string;
  slug: string;
  postcode: string;
  districtSlug: string;
  districtName: string;
  province: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
}

export interface CitySearchResult {
  hits: CityHit[];
  total: number;
  isFallback: boolean;
  disclaimer: string | null;
  sourceId: typeof SLCITIES_API_SOURCE_ID | typeof SLCITIES_SEED_SOURCE_ID;
}

export interface PostcodeResult {
  city: CityHit | null;
  isFallback: boolean;
  disclaimer: string | null;
  sourceId: typeof SLCITIES_API_SOURCE_ID | typeof SLCITIES_SEED_SOURCE_ID;
}

export interface NearbyCitiesResult {
  cities: CityHit[];
  total: number;
  center: { latitude: number; longitude: number };
  radiusKm: number;
  isFallback: boolean;
  disclaimer: string | null;
  sourceId: typeof SLCITIES_API_SOURCE_ID | typeof SLCITIES_SEED_SOURCE_ID;
}

export interface DistrictCitiesResult {
  districtSlug: string;
  districtName: string;
  cities: CityHit[];
  total: number;
  isFallback: boolean;
  disclaimer: string | null;
  sourceId: typeof SLCITIES_API_SOURCE_ID | typeof SLCITIES_SEED_SOURCE_ID;
}

export interface SeedCity {
  name: string;
  slug: string;
  postcode: string;
  districtSlug: string;
  districtName: string;
  province: string;
  latitude: number;
  longitude: number;
  altNames?: string[];
}

export interface SeedDistrict {
  slug: string;
  name: string;
  nameSi: string;
  nameTa: string;
  province: string;
  capital: string;
  population: number;
  areaSqKm: number;
  latitude: number;
  longitude: number;
  cities: SeedCity[];
}

const SEED_DISTRICTS: SeedDistrict[] = (districtSeedData as { districts: SeedDistrict[] }).districts ?? [];

const ALL_SEED_CITIES: SeedCity[] = SEED_DISTRICTS.flatMap((d) => d.cities ?? []);

function buildTimeoutSignal(timeoutMs: number = FETCH_TIMEOUT_MS): AbortSignal | undefined {
  if (typeof AbortSignal === "undefined" || !("timeout" in AbortSignal)) {
    return undefined;
  }
  return (
    AbortSignal as typeof AbortSignal & { timeout(ms: number): AbortSignal }
  ).timeout(timeoutMs);
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

function mapSeedCityToHit(c: SeedCity): CityHit {
  return {
    name: c.name,
    slug: c.slug,
    postcode: c.postcode,
    districtSlug: c.districtSlug,
    districtName: c.districtName,
    province: c.province,
    latitude: c.latitude,
    longitude: c.longitude,
  };
}

async function fetchWithTimeout(url: string): Promise<any> {
  const signal = buildTimeoutSignal(FETCH_TIMEOUT_MS);
  const res = await fetch(url, {
    headers: {
      "User-Agent": "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)",
      Accept: "application/json",
    },
    signal,
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }
  return res.json();
}

/**
 * Searches cities by query string (name, postcode, district).
 */
export async function getCitySearch(query: string): Promise<CitySearchResult> {
  const q = query.trim().toLowerCase();

  // Try primary API
  try {
    const data = await fetchWithTimeout(`${PRIMARY_API_URL}/cities/search?q=${encodeURIComponent(query)}`);
    if (Array.isArray(data) && data.length > 0) {
      const hits: CityHit[] = data.map((item: any) => ({
        name: item.name ?? item.cityName,
        slug: item.slug ?? (item.name ? item.name.toLowerCase().replace(/\s+/g, "-") : ""),
        postcode: String(item.postcode ?? item.postalCode ?? ""),
        districtSlug: item.districtSlug ?? (item.district ? item.district.toLowerCase() : ""),
        districtName: item.districtName ?? item.district ?? "",
        province: item.province ?? "",
        latitude: Number(item.latitude ?? item.lat ?? 0),
        longitude: Number(item.longitude ?? item.lng ?? item.lon ?? 0),
      }));
      return {
        hits,
        total: hits.length,
        isFallback: false,
        disclaimer: null,
        sourceId: SLCITIES_API_SOURCE_ID,
      };
    }
  } catch {
    // Primary failed, continue to secondary
  }

  // Try secondary API
  try {
    const data = await fetchWithTimeout(`${SECONDARY_API_URL}/cities/cordinates/${encodeURIComponent(query)}`);
    if (Array.isArray(data) && data.length > 0) {
      const hits: CityHit[] = data.map((item: any) => ({
        name: item.name ?? item.cityName ?? item.city,
        slug: (item.name ?? item.city ?? "").toLowerCase().replace(/\s+/g, "-"),
        postcode: String(item.postcode ?? item.postalCode ?? ""),
        districtSlug: item.districtSlug ?? (item.district ? item.district.toLowerCase() : ""),
        districtName: item.districtName ?? item.district ?? "",
        province: item.province ?? "",
        latitude: Number(item.latitude ?? item.lat ?? 0),
        longitude: Number(item.longitude ?? item.lng ?? item.lon ?? 0),
      }));
      return {
        hits,
        total: hits.length,
        isFallback: false,
        disclaimer: null,
        sourceId: SLCITIES_API_SOURCE_ID,
      };
    }
  } catch {
    // Secondary failed, fall back to seed
  }

  // Seed fallback
  const filtered = ALL_SEED_CITIES.filter((c) => {
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.postcode.includes(q) ||
      c.districtSlug.toLowerCase().includes(q) ||
      c.districtName.toLowerCase().includes(q) ||
      c.province.toLowerCase().includes(q) ||
      (c.altNames && c.altNames.some((alt) => alt.toLowerCase().includes(q)))
    );
  });

  const hits = filtered.map(mapSeedCityToHit);
  return {
    hits,
    total: hits.length,
    isFallback: true,
    disclaimer: SEED_FALLBACK_DISCLAIMER,
    sourceId: SLCITIES_SEED_SOURCE_ID,
  };
}

/**
 * Looks up a city by 5-digit postal code.
 */
export async function lookupPostcode(code: string): Promise<PostcodeResult> {
  const sanitized = code.replace(/\D/g, "").padStart(5, "0").slice(0, 5);

  // Try primary API
  try {
    const data = await fetchWithTimeout(`${PRIMARY_API_URL}/cities/postcode/${sanitized}`);
    if (data && (data.name || data.cityName)) {
      const city: CityHit = {
        name: data.name ?? data.cityName,
        slug: data.slug ?? (data.name ? data.name.toLowerCase().replace(/\s+/g, "-") : ""),
        postcode: String(data.postcode ?? data.postalCode ?? sanitized),
        districtSlug: data.districtSlug ?? (data.district ? data.district.toLowerCase() : ""),
        districtName: data.districtName ?? data.district ?? "",
        province: data.province ?? "",
        latitude: Number(data.latitude ?? data.lat ?? 0),
        longitude: Number(data.longitude ?? data.lng ?? data.lon ?? 0),
      };
      return {
        city,
        isFallback: false,
        disclaimer: null,
        sourceId: SLCITIES_API_SOURCE_ID,
      };
    }
  } catch {
    // Primary failed, fall back
  }

  // Seed fallback
  const found = ALL_SEED_CITIES.find((c) => c.postcode === sanitized || c.postcode === code);
  return {
    city: found ? mapSeedCityToHit(found) : null,
    isFallback: true,
    disclaimer: SEED_FALLBACK_DISCLAIMER,
    sourceId: SLCITIES_SEED_SOURCE_ID,
  };
}

/**
 * Retrieves cities near given coordinates within radiusKm.
 */
export async function getNearbyCities(
  lat: number,
  lng: number,
  radiusKm: number = 20,
): Promise<NearbyCitiesResult> {
  // Try primary API
  try {
    const data = await fetchWithTimeout(
      `${PRIMARY_API_URL}/cities/nearby?lat=${lat}&lon=${lng}&radius=${radiusKm}`,
    );
    if (Array.isArray(data) && data.length > 0) {
      const cities: CityHit[] = data.map((item: any) => {
        const cityLat = Number(item.latitude ?? item.lat ?? 0);
        const cityLng = Number(item.longitude ?? item.lng ?? item.lon ?? 0);
        return {
          name: item.name ?? item.cityName,
          slug: item.slug ?? (item.name ? item.name.toLowerCase().replace(/\s+/g, "-") : ""),
          postcode: String(item.postcode ?? item.postalCode ?? ""),
          districtSlug: item.districtSlug ?? (item.district ? item.district.toLowerCase() : ""),
          districtName: item.districtName ?? item.district ?? "",
          province: item.province ?? "",
          latitude: cityLat,
          longitude: cityLng,
          distanceKm: item.distanceKm ?? haversineDistanceKm(lat, lng, cityLat, cityLng),
        };
      });
      cities.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
      return {
        cities,
        total: cities.length,
        center: { latitude: lat, longitude: lng },
        radiusKm,
        isFallback: false,
        disclaimer: null,
        sourceId: SLCITIES_API_SOURCE_ID,
      };
    }
  } catch {
    // Primary failed, fall back
  }

  // Seed fallback using Haversine formula
  const nearby: CityHit[] = ALL_SEED_CITIES.map((c) => {
    const dist = haversineDistanceKm(lat, lng, c.latitude, c.longitude);
    return {
      ...mapSeedCityToHit(c),
      distanceKm: dist,
    };
  })
    .filter((c) => (c.distanceKm ?? 0) <= radiusKm)
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  return {
    cities: nearby,
    total: nearby.length,
    center: { latitude: lat, longitude: lng },
    radiusKm,
    isFallback: true,
    disclaimer: SEED_FALLBACK_DISCLAIMER,
    sourceId: SLCITIES_SEED_SOURCE_ID,
  };
}

/**
 * Returns all cities in a specified district slug.
 */
export async function getDistrictCities(
  districtSlug: string,
): Promise<DistrictCitiesResult> {
  const normSlug = districtSlug.toLowerCase().trim();

  // Try primary API
  try {
    const data = await fetchWithTimeout(`${PRIMARY_API_URL}/districts/${normSlug}/cities`);
    if (Array.isArray(data) && data.length > 0) {
      const cities: CityHit[] = data.map((item: any) => ({
        name: item.name ?? item.cityName,
        slug: item.slug ?? (item.name ? item.name.toLowerCase().replace(/\s+/g, "-") : ""),
        postcode: String(item.postcode ?? item.postalCode ?? ""),
        districtSlug: normSlug,
        districtName: item.districtName ?? item.district ?? "",
        province: item.province ?? "",
        latitude: Number(item.latitude ?? item.lat ?? 0),
        longitude: Number(item.longitude ?? item.lng ?? item.lon ?? 0),
      }));
      const districtName = cities[0]?.districtName || normSlug;
      return {
        districtSlug: normSlug,
        districtName,
        cities,
        total: cities.length,
        isFallback: false,
        disclaimer: null,
        sourceId: SLCITIES_API_SOURCE_ID,
      };
    }
  } catch {
    // Primary failed
  }

  // Try secondary API
  try {
    const data = await fetchWithTimeout(`${SECONDARY_API_URL}/cities/byDistrict/${normSlug}`);
    if (Array.isArray(data) && data.length > 0) {
      const cities: CityHit[] = data.map((item: any) => ({
        name: item.name ?? item.cityName ?? item.city,
        slug: (item.name ?? item.city ?? "").toLowerCase().replace(/\s+/g, "-"),
        postcode: String(item.postcode ?? item.postalCode ?? ""),
        districtSlug: normSlug,
        districtName: item.districtName ?? item.district ?? "",
        province: item.province ?? "",
        latitude: Number(item.latitude ?? item.lat ?? 0),
        longitude: Number(item.longitude ?? item.lng ?? item.lon ?? 0),
      }));
      const districtName = cities[0]?.districtName || normSlug;
      return {
        districtSlug: normSlug,
        districtName,
        cities,
        total: cities.length,
        isFallback: false,
        disclaimer: null,
        sourceId: SLCITIES_API_SOURCE_ID,
      };
    }
  } catch {
    // Secondary failed
  }

  // Seed fallback
  const dMatch = SEED_DISTRICTS.find((d) => d.slug.toLowerCase() === normSlug);
  const districtName = dMatch ? dMatch.name : normSlug;
  const filtered = ALL_SEED_CITIES.filter((c) => c.districtSlug.toLowerCase() === normSlug);
  const cities = filtered.map(mapSeedCityToHit);

  return {
    districtSlug: normSlug,
    districtName,
    cities,
    total: cities.length,
    isFallback: true,
    disclaimer: SEED_FALLBACK_DISCLAIMER,
    sourceId: SLCITIES_SEED_SOURCE_ID,
  };
}
