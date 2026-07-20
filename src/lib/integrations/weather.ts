import { getLatestObservation, isDatabaseConfigured } from "../db";
import { getDistrictCoords } from "../district-coords";
import { computeFreshnessTier } from "../freshness";
import { getSource, getSourceProvenancePath } from "../sources";
import type { FreshnessTier, PulseMetric, SourceHealth } from "../types";

export interface PlaceWeather {
  temp: number;
  label: string;
  precipitation: number;
  uvIndex: number | null;
  uvIndexMaxToday: number | null;
  rainNext7dMm: number | null;
  rainTomorrowMm: number | null;
  observedAt: string;
  placeLabel: string;
  districtSlug: string;
}

/** @deprecated Use PlaceWeather — kept for call-site compatibility. */
export type ColomboWeather = PlaceWeather;

interface OpenMeteoResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    weather_code?: number;
    precipitation?: number;
    uv_index?: number;
  };
  daily?: {
    time?: string[];
    uv_index_max?: number[];
    precipitation_sum?: number[];
  };
}

/** WMO weather interpretation codes → short English labels. */
export function wmoCodeToLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

function buildOpenMeteoUrl(latitude: number, longitude: number): string {
  return (
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    "&current=temperature_2m,weather_code,precipitation,uv_index" +
    "&daily=uv_index_max,precipitation_sum&forecast_days=7&timezone=Asia/Colombo"
  );
}

export async function fetchPlaceWeather(
  districtSlug = "colombo",
  placeLabel = "Colombo",
): Promise<PlaceWeather> {
  const { latitude, longitude } = getDistrictCoords(districtSlug);
  const response = await fetch(buildOpenMeteoUrl(latitude, longitude), {
    next: { revalidate: 1800 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo returned ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const current = data.current;
  const daily = data.daily;

  if (
    current?.temperature_2m == null ||
    current.weather_code == null ||
    current.precipitation == null
  ) {
    throw new Error("Open-Meteo response missing current weather fields");
  }

  const precipSums = daily?.precipitation_sum ?? [];
  const uvMax = daily?.uv_index_max ?? [];
  const rainNext7dMm =
    precipSums.length > 0
      ? precipSums.reduce((sum, value) => sum + (Number(value) || 0), 0)
      : null;

  return {
    temp: current.temperature_2m,
    label: wmoCodeToLabel(current.weather_code),
    precipitation: current.precipitation,
    uvIndex: typeof current.uv_index === "number" ? current.uv_index : null,
    uvIndexMaxToday: typeof uvMax[0] === "number" ? uvMax[0] : null,
    rainNext7dMm,
    rainTomorrowMm: typeof precipSums[1] === "number" ? precipSums[1] : null,
    observedAt: current.time ?? new Date().toISOString(),
    placeLabel,
    districtSlug,
  };
}

export async function fetchColomboWeather(): Promise<PlaceWeather> {
  return fetchPlaceWeather("colombo", "Colombo");
}

function weatherContribution(
  source: NonNullable<ReturnType<typeof getSource>>,
  checkedAt: string,
  weather: PlaceWeather,
): { metric: PulseMetric; health: SourceHealth } {
  const tier = computeFreshnessTier(weather.observedAt, source.cadenceMinutes);
  const noteParts = [weather.label];
  if (weather.precipitation > 0) {
    noteParts.push(`${weather.precipitation.toFixed(1)} mm`);
  }
  const uv = weather.uvIndexMaxToday ?? weather.uvIndex;
  if (uv != null) {
    noteParts.push(`UV ${uv.toFixed(0)}`);
  }
  if (weather.rainNext7dMm != null) {
    noteParts.push(`7d rain ${weather.rainNext7dMm.toFixed(0)} mm`);
  }

  return {
    metric: {
      id: "weather_colombo",
      label: `${weather.placeLabel} weather`,
      value: weather.temp.toFixed(1),
      unit: "°C",
      observedAt: weather.observedAt,
      tier,
      sourceId: source.id,
      provenancePath: getSourceProvenancePath(source.id),
      note: noteParts.join(" · "),
    },
    health: {
      id: source.id,
      name: source.name,
      category: source.category,
      tier,
      lastSuccessAt: weather.observedAt,
      lastCheckedAt: checkedAt,
      error: null,
      provenancePath: getSourceProvenancePath(source.id),
    },
  };
}

export async function buildWeatherPulseMetric(
  checkedAt: string,
  options?: { districtSlug?: string; placeLabel?: string },
): Promise<{
  metric: PulseMetric;
  health: SourceHealth;
}> {
  const source = getSource("open_meteo")!;
  const districtSlug = options?.districtSlug ?? "colombo";
  const placeLabel = options?.placeLabel ?? "Colombo";

  try {
    if (isDatabaseConfigured() && districtSlug === "colombo") {
      const dbObservation = await getLatestObservation(
        source.id,
        "weather_colombo_temp",
      );
      if (dbObservation) {
        return weatherContribution(source, checkedAt, {
          temp: dbObservation.value,
          label: "Colombo",
          precipitation: 0,
          uvIndex: null,
          uvIndexMaxToday: null,
          rainNext7dMm: null,
          rainTomorrowMm: null,
          observedAt: dbObservation.observedAt,
          placeLabel: "Colombo",
          districtSlug: "colombo",
        });
      }
    }

    const weather = await fetchPlaceWeather(districtSlug, placeLabel);
    return weatherContribution(source, checkedAt, weather);
  } catch (error) {
    const tier: FreshnessTier = "down";

    return {
      metric: {
        id: "weather_colombo",
        label: `${placeLabel} weather`,
        value: "—",
        unit: "°C",
        observedAt: null,
        tier,
        sourceId: source.id,
        provenancePath: getSourceProvenancePath(source.id),
        note: "Open-Meteo unavailable",
      },
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier,
        lastSuccessAt: null,
        lastCheckedAt: checkedAt,
        error: error instanceof Error ? error.message : "Unknown error",
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  }
}
