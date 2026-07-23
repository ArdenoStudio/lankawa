import envData from "@/data/environment-seed.json";
import { getDistrictCoords } from "@/lib/district-coords";
import { DISTRICTS } from "@/lib/districts";
import type {
  AqiBand,
  ColomboAirQualitySnapshot,
  EnvironmentDistrictStat,
  EnvironmentSnapshot,
} from "@/lib/types";

const OPENAQ_SOURCE_ID = "openaq_lk";
const OPENAQ_SOURCE_NAME = "OpenAQ Sri Lanka PM2.5";
/** OpenAQ v3 country id for Sri Lanka (LK) — must match catalog-health probe. */
const OPENAQ_COUNTRY_ID = 207;
const OPENAQ_PM25_PARAMETER_ID = 2;
const OPENAQ_TIMEOUT_MS = 8_000;
const OPENAQ_REVALIDATE_SECONDS = 3600;

const OPEN_METEO_AQ_SOURCE_ID = "open_meteo_air_quality";
const OPEN_METEO_AQ_SOURCE_NAME = "Open-Meteo Air Quality";
const OPEN_METEO_AQ_TIMEOUT_MS = 8_000;
const OPEN_METEO_AQ_REVALIDATE_SECONDS = 1800;
const COLOMBO_SLUG = "colombo";

const seedSnapshot = envData as EnvironmentSnapshot;

interface OpenAQLocationsResponse {
  results?: OpenAQLocation[];
}

interface OpenAQLocation {
  id?: number;
  name?: string;
  locality?: string;
  city?: string;
  country?: { code?: string; id?: number };
  sensors?: OpenAQSensor[];
}

interface OpenAQSensor {
  id?: number;
  parameter?: {
    id?: number;
    name?: string;
  };
}

interface OpenAQLatestResponse {
  results?: OpenAQLatestMeasurement[];
}

interface OpenAQLatestMeasurement {
  value?: number;
  datetime?: string | { utc?: string; local?: string };
  parameter?: {
    id?: number;
    name?: string;
  };
}

interface OpenAQV2LatestResponse {
  results?: Array<{
    location?: string;
    city?: string;
    country?: string;
    measurements?: Array<{
      parameter?: string;
      value?: number;
      lastUpdated?: string;
      unit?: string;
    }>;
  }>;
}

interface OpenMeteoAirQualityResponse {
  current?: {
    time?: string;
    european_aqi?: number;
    us_aqi?: number;
    pm10?: number;
    pm2_5?: number;
    carbon_monoxide?: number;
    nitrogen_dioxide?: number;
    sulphur_dioxide?: number;
    ozone?: number;
    uv_index?: number;
    dust?: number;
  };
}

interface LiveReading {
  slug: string;
  pm25: number;
  observedAt: string;
  aqi?: number;
}

function getOpenAqApiKey(): string | undefined {
  return process.env.OPENAQ_API_KEY ?? process.env.NEXT_PUBLIC_OPENAQ_API_KEY;
}

async function fetchJson<T>(url: string, apiKey?: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAQ_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)",
    };
    if (apiKey) {
      headers["X-API-Key"] = apiKey;
    }

    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: OPENAQ_REVALIDATE_SECONDS },
      headers,
    });

    if (!response.ok) {
      throw new Error(`OpenAQ returned ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function districtSlugFromText(value: string): string | null {
  const normalized = ` ${normalizeText(value)} `;
  for (const district of DISTRICTS) {
    const names = [district.name, district.capital, district.slug.replace(/-/g, " ")];
    if (names.some((name) => normalized.includes(` ${normalizeText(name)} `))) {
      return district.slug;
    }
  }
  return null;
}

function observedAtFromDatetime(
  value: OpenAQLatestMeasurement["datetime"],
): string {
  if (typeof value === "string") {
    return value;
  }
  return value?.utc ?? value?.local ?? new Date().toISOString();
}

function pm25ToAqi(pm25: number): number {
  const breakpoints = [
    { cLow: 0, cHigh: 12, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
  ];
  const roundedPm25 = Math.max(0, Math.round(pm25 * 10) / 10);
  const breakpoint =
    breakpoints.find(
      (item) => roundedPm25 >= item.cLow && roundedPm25 <= item.cHigh,
    ) ?? breakpoints[breakpoints.length - 1];

  return Math.round(
    ((breakpoint.iHigh - breakpoint.iLow) /
      (breakpoint.cHigh - breakpoint.cLow)) *
      (roundedPm25 - breakpoint.cLow) +
      breakpoint.iLow,
  );
}

function aqiBandFromAqi(aqi: number): AqiBand {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy_sensitive";
  if (aqi <= 200) return "unhealthy";
  return "very_unhealthy";
}

function readingToDistrictStat(reading: LiveReading): EnvironmentDistrictStat {
  const aqi = reading.aqi ?? pm25ToAqi(reading.pm25);
  return {
    slug: reading.slug,
    aqi,
    band: aqiBandFromAqi(aqi),
    pm25: Math.round(reading.pm25 * 10) / 10,
  };
}

function latestTimestamp(readings: LiveReading[]): string {
  return readings
    .map((reading) => reading.observedAt)
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function optionalNumber(value: number | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? roundOne(value) : null;
}

function normalizeOpenMeteoObservedAt(time: string | undefined): string {
  if (!time) {
    return new Date().toISOString();
  }
  if (time.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(time)) {
    return time;
  }
  // Open-Meteo returns local Asia/Colombo wall time without offset.
  return `${time}:00+05:30`;
}

function buildOpenMeteoAirQualityUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      "european_aqi",
      "us_aqi",
      "pm10",
      "pm2_5",
      "carbon_monoxide",
      "nitrogen_dioxide",
      "sulphur_dioxide",
      "ozone",
      "uv_index",
      "dust",
    ].join(","),
    timezone: "Asia/Colombo",
  });
  return `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`;
}

/**
 * Colombo multi-pollutant air quality from Open-Meteo model grid.
 * Complements OpenAQ station PM2.5 — not a DMC/CEA official reading.
 */
export async function fetchColomboOpenMeteoAirQuality(): Promise<ColomboAirQualitySnapshot | null> {
  const { latitude, longitude } = getDistrictCoords(COLOMBO_SLUG);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPEN_METEO_AQ_TIMEOUT_MS);

  try {
    const response = await fetch(buildOpenMeteoAirQualityUrl(latitude, longitude), {
      signal: controller.signal,
      next: { revalidate: OPEN_METEO_AQ_REVALIDATE_SECONDS },
      headers: {
        Accept: "application/json",
        "User-Agent": "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)",
      },
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo air-quality returned ${response.status}`);
    }

    const data = (await response.json()) as OpenMeteoAirQualityResponse;
    const current = data.current;
    if (current?.us_aqi == null || current.pm2_5 == null) {
      throw new Error("Open-Meteo air-quality response missing us_aqi or pm2_5");
    }

    const usAqi = Math.round(current.us_aqi);
    return {
      sourceId: OPEN_METEO_AQ_SOURCE_ID,
      sourceName: OPEN_METEO_AQ_SOURCE_NAME,
      asOf: normalizeOpenMeteoObservedAt(current.time),
      usAqi,
      europeanAqi:
        typeof current.european_aqi === "number"
          ? Math.round(current.european_aqi)
          : null,
      pm25: roundOne(current.pm2_5),
      pm10: optionalNumber(current.pm10),
      nitrogenDioxide: optionalNumber(current.nitrogen_dioxide),
      sulphurDioxide: optionalNumber(current.sulphur_dioxide),
      ozone: optionalNumber(current.ozone),
      carbonMonoxide: optionalNumber(current.carbon_monoxide),
      dust: optionalNumber(current.dust),
      uvIndex: optionalNumber(current.uv_index),
      band: aqiBandFromAqi(usAqi),
      honestyNote:
        "Open-Meteo air-quality model grid near Colombo — not a DMC/CEA station reading.",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchOpenAqV3Readings(): Promise<LiveReading[]> {
  const apiKey = getOpenAqApiKey();
  if (!apiKey) {
    return [];
  }

  const params = new URLSearchParams({
    countries_id: String(OPENAQ_COUNTRY_ID),
    parameters_id: String(OPENAQ_PM25_PARAMETER_ID),
    limit: "100",
    page: "1",
  });
  const locations = await fetchJson<OpenAQLocationsResponse>(
    `https://api.openaq.org/v3/locations?${params.toString()}`,
    apiKey,
  );

  const locationCandidates = (locations.results ?? []).slice(0, 20);
  const results = await Promise.allSettled(locationCandidates.map(async (location) => {
    const slug = districtSlugFromText(
      [location.name, location.locality, location.city].filter(Boolean).join(" "),
    );
    if (!slug || location.id == null) {
      return null;
    }

    const latestParams = new URLSearchParams({
      parameters_id: String(OPENAQ_PM25_PARAMETER_ID),
      limit: "10",
    });
    const latest = await fetchJson<OpenAQLatestResponse>(
      `https://api.openaq.org/v3/locations/${location.id}/latest?${latestParams.toString()}`,
      apiKey,
    );

    const measurement = (latest.results ?? []).find((item) => {
      const parameterName = item.parameter?.name?.toLowerCase();
      return (
        item.value != null &&
        (item.parameter?.id === OPENAQ_PM25_PARAMETER_ID || parameterName === "pm25")
      );
    });

    if (measurement?.value == null || measurement.value < 0) {
      return null;
    }

    return {
      slug,
      pm25: measurement.value,
      observedAt: observedAtFromDatetime(measurement.datetime),
    };
  }));

  return results.flatMap((result) =>
    result.status === "fulfilled" && result.value ? [result.value] : [],
  );
}

async function fetchOpenAqV2Readings(): Promise<LiveReading[]> {
  const params = new URLSearchParams({
    country: "LK",
    parameter: "pm25",
    limit: "100",
  });
  const data = await fetchJson<OpenAQV2LatestResponse>(
    `https://api.openaq.org/v2/latest?${params.toString()}`,
  );

  return (data.results ?? []).flatMap((item) => {
    const slug = districtSlugFromText([item.location, item.city].filter(Boolean).join(" "));
    if (!slug || item.country !== "LK") {
      return [];
    }

    const measurement = (item.measurements ?? []).find(
      (entry) => entry.parameter === "pm25" && entry.value != null && entry.value >= 0,
    );
    if (measurement?.value == null) {
      return [];
    }

    return [
      {
        slug,
        pm25: measurement.value,
        observedAt: measurement.lastUpdated ?? new Date().toISOString(),
      },
    ];
  });
}

async function fetchLiveReadings(): Promise<LiveReading[]> {
  try {
    const v3Readings = await fetchOpenAqV3Readings();
    if (v3Readings.length > 0) {
      return v3Readings;
    }
  } catch {
    // Fall through to the retired v2 shape for legacy mirrors or local fixtures.
  }

  try {
    return await fetchOpenAqV2Readings();
  } catch {
    return [];
  }
}

export async function getEnvironmentData(): Promise<EnvironmentSnapshot> {
  const [readings, openMeteoColombo] = await Promise.all([
    fetchLiveReadings(),
    fetchColomboOpenMeteoAirQuality(),
  ]);

  const liveByDistrict = new Map<string, LiveReading>();
  for (const reading of readings) {
    const existing = liveByDistrict.get(reading.slug);
    if (!existing || Date.parse(reading.observedAt) > Date.parse(existing.observedAt)) {
      liveByDistrict.set(reading.slug, reading);
    }
  }

  const openAqCoveredColombo = liveByDistrict.has(COLOMBO_SLUG);
  if (!openAqCoveredColombo && openMeteoColombo) {
    liveByDistrict.set(COLOMBO_SLUG, {
      slug: COLOMBO_SLUG,
      pm25: openMeteoColombo.pm25,
      aqi: openMeteoColombo.usAqi,
      observedAt: openMeteoColombo.asOf,
    });
  }

  if (liveByDistrict.size === 0) {
    return seedSnapshot;
  }

  const openAqCount = readings.length;
  const usedOpenMeteoFallback = !openAqCoveredColombo && openMeteoColombo != null;
  let sourceId = OPENAQ_SOURCE_ID;
  let sourceName = OPENAQ_SOURCE_NAME;

  if (openAqCount === 0 && usedOpenMeteoFallback) {
    sourceId = OPEN_METEO_AQ_SOURCE_ID;
    sourceName = `${OPEN_METEO_AQ_SOURCE_NAME} (Colombo model + seed districts)`;
  } else if (liveByDistrict.size < seedSnapshot.districts.length) {
    sourceName = usedOpenMeteoFallback
      ? `${OPENAQ_SOURCE_NAME} (mixed live + Open-Meteo Colombo + seed)`
      : `${OPENAQ_SOURCE_NAME} (mixed live + seed coverage)`;
  }

  return {
    sourceId,
    sourceName,
    asOf: latestTimestamp([...liveByDistrict.values()]) ?? new Date().toISOString(),
    districts: seedSnapshot.districts.map((district) => {
      const live = liveByDistrict.get(district.slug);
      return live ? readingToDistrictStat(live) : district;
    }),
  };
}
