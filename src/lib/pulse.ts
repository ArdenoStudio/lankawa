import { computeFreshnessTier } from "./freshness";
import { getLatestObservation, isDatabaseConfigured, savePulseSnapshot } from "./db";
import { fetchLatestCbslFxRate } from "./integrations/cbsl";
import { fetchFloodAlertSummary } from "./integrations/flood";
import {
  buildCsePulseMetricFromSnapshot,
  buildCseSnapshot,
  CSE_SOURCE_ID,
} from "./integrations/cse";
import { getEnvironmentData } from "./integrations/aqi";
import { buildNewsPulseMetric, fetchNewsPulse } from "./integrations/news";
import { fetchOctanePrices, pickCpcPrice } from "./integrations/octane";
import { buildPowerPulseMetric } from "./integrations/power";
import { getPropertyData } from "./integrations/propertylk";
import { getVehicleData } from "./integrations/vehicle";
import { buildWeatherPulseMetric } from "./integrations/weather";
import { formatPropertyPrice } from "./property";
import { formatVehiclePrice } from "./vehicle";
import { getSource, getSourceProvenancePath } from "./sources";
import type {
  PropertySnapshot,
  PulseMetric,
  PulseSnapshot,
  SourceHealth,
  VehicleSnapshot,
} from "./types";

export { TODAY_METRIC_IDS, getTodayPulseMetrics } from "./pulse-today";

const FX_FALLBACK_RATE = 302.5;
const FX_FALLBACK_DATE = "2026-07-18T00:00:00.000Z";
const FUEL_FALLBACK_PETROL = 414;
const FUEL_FALLBACK_DIESEL = 382;
const FUEL_FALLBACK_DATE = "2026-06-30T00:00:00.000Z";

async function buildFuelMetrics(checkedAt: string): Promise<{
  metrics: PulseMetric[];
  health: SourceHealth;
}> {
  const source = getSource("octane_fuel")!;
  try {
    const data = await fetchOctanePrices();
    const petrol92 = pickCpcPrice(data.prices, "petrol_92");
    const diesel = pickCpcPrice(data.prices, "auto_diesel");
    const observedAt = petrol92?.recorded_at ?? diesel?.recorded_at ?? null;
    const tier = computeFreshnessTier(observedAt, source.cadenceMinutes);

    const metrics: PulseMetric[] = [];
    if (petrol92) {
      metrics.push({
        id: "fuel_petrol_92",
        label: "Petrol 92",
        value: petrol92.price_lkr.toFixed(2),
        unit: "LKR/L",
        observedAt: petrol92.recorded_at,
        tier,
        sourceId: source.id,
        provenancePath: getSourceProvenancePath(source.id),
      });
    }
    if (diesel) {
      metrics.push({
        id: "fuel_diesel",
        label: "Auto Diesel",
        value: diesel.price_lkr.toFixed(2),
        unit: "LKR/L",
        observedAt: diesel.recorded_at,
        tier,
        sourceId: source.id,
        provenancePath: getSourceProvenancePath(source.id),
      });
    }

    return {
      metrics,
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier,
        lastSuccessAt: observedAt,
        lastCheckedAt: checkedAt,
        error: null,
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  } catch (error) {
    const tier = computeFreshnessTier(FUEL_FALLBACK_DATE, source.cadenceMinutes);
    return {
      metrics: [
        {
          id: "fuel_petrol_92",
          label: "Petrol 92",
          value: FUEL_FALLBACK_PETROL.toFixed(2),
          unit: "LKR/L",
          observedAt: FUEL_FALLBACK_DATE,
          tier,
          sourceId: source.id,
          provenancePath: getSourceProvenancePath(source.id),
          note: "Fallback — Octane API unavailable",
        },
        {
          id: "fuel_diesel",
          label: "Auto Diesel",
          value: FUEL_FALLBACK_DIESEL.toFixed(2),
          unit: "LKR/L",
          observedAt: FUEL_FALLBACK_DATE,
          tier,
          sourceId: source.id,
          provenancePath: getSourceProvenancePath(source.id),
          note: "Fallback — Octane API unavailable",
        },
      ],
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier,
        lastSuccessAt: FUEL_FALLBACK_DATE,
        lastCheckedAt: checkedAt,
        error: error instanceof Error ? error.message : "Unknown error",
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  }
}

async function buildFloodData(checkedAt: string): Promise<{
  flood: PulseSnapshot["flood"];
  health: SourceHealth;
}> {
  const source = getSource("lk_flood_api")!;
  try {
    const flood = await fetchFloodAlertSummary();
    const tier: PulseSnapshot["sources"][number]["tier"] = "fresh";

    return {
      flood,
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier,
        lastSuccessAt: checkedAt,
        lastCheckedAt: checkedAt,
        error: null,
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  } catch (error) {
    return {
      flood: [],
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier: "down",
        lastSuccessAt: null,
        lastCheckedAt: checkedAt,
        error: error instanceof Error ? error.message : "Unknown error",
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  }
}

async function buildFxMetric(checkedAt: string): Promise<{
  metric: PulseMetric;
  health: SourceHealth;
}> {
  const source = getSource("cbsl_fx")!;

  try {
    const dbObservation = await getLatestObservation(source.id, "usd_lkr_sell");
    if (dbObservation) {
      const buyObservation = await getLatestObservation(source.id, "usd_lkr_buy");
      const tier = computeFreshnessTier(
        dbObservation.observedAt,
        source.cadenceMinutes,
      );
      const note =
        buyObservation != null
          ? `Buy ${buyObservation.value.toFixed(2)} / Sell ${dbObservation.value.toFixed(2)}`
          : undefined;

      return {
        metric: {
          id: "usd_lkr",
          label: "USD / LKR",
          value: dbObservation.value.toFixed(2),
          unit: "LKR",
          observedAt: dbObservation.observedAt,
          tier,
          sourceId: source.id,
          provenancePath: getSourceProvenancePath(source.id),
          note,
        },
        health: {
          id: source.id,
          name: source.name,
          category: source.category,
          tier,
          lastSuccessAt: dbObservation.observedAt,
          lastCheckedAt: checkedAt,
          error: null,
          provenancePath: getSourceProvenancePath(source.id),
        },
      };
    }

    const latest = await fetchLatestCbslFxRate();
    const tier = computeFreshnessTier(latest.observedAt, source.cadenceMinutes);

    return {
      metric: {
        id: "usd_lkr",
        label: "USD / LKR",
        value: latest.sellRate.toFixed(2),
        unit: "LKR",
        observedAt: latest.observedAt,
        tier,
        sourceId: source.id,
        provenancePath: getSourceProvenancePath(source.id),
        note: `Buy ${latest.buyRate.toFixed(2)} / Sell ${latest.sellRate.toFixed(2)}`,
      },
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier,
        lastSuccessAt: latest.observedAt,
        lastCheckedAt: checkedAt,
        error: null,
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  } catch (error) {
    const tier = computeFreshnessTier(FX_FALLBACK_DATE, source.cadenceMinutes);

    return {
      metric: {
        id: "usd_lkr",
        label: "USD / LKR",
        value: FX_FALLBACK_RATE.toFixed(2),
        unit: "LKR",
        observedAt: FX_FALLBACK_DATE,
        tier,
        sourceId: source.id,
        provenancePath: getSourceProvenancePath(source.id),
        note: "Fallback value — CBSL scrape unavailable",
      },
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier,
        lastSuccessAt: FX_FALLBACK_DATE,
        lastCheckedAt: checkedAt,
        error: error instanceof Error ? error.message : "Unknown error",
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  }
}

async function buildNewsData(checkedAt: string): Promise<{
  contribution: { metric: PulseMetric; health: SourceHealth } | null;
}> {
  const source = getSource("news_rss")!;

  try {
    if (isDatabaseConfigured()) {
      const dbObservation = await getLatestObservation(source.id, "headline_count");
      if (dbObservation) {
        const tier = computeFreshnessTier(
          dbObservation.observedAt,
          source.cadenceMinutes,
        );
        return {
          contribution: {
            metric: {
              id: "news_headlines",
              label: "Sri Lanka news",
              value: String(Math.round(dbObservation.value)),
              unit: "headlines",
              observedAt: dbObservation.observedAt,
              tier,
              sourceId: source.id,
              provenancePath: getSourceProvenancePath(source.id),
              note: "From ingest cache",
            },
            health: {
              id: source.id,
              name: source.name,
              category: source.category,
              tier,
              lastSuccessAt: dbObservation.observedAt,
              lastCheckedAt: checkedAt,
              error: null,
              provenancePath: getSourceProvenancePath(source.id),
            },
          },
        };
      }
    }

    const pulse = await fetchNewsPulse();
    return { contribution: buildNewsPulseMetric(checkedAt, pulse) };
  } catch (error) {
    return {
      contribution: {
        metric: {
          id: "news_headlines",
          label: "Sri Lanka news",
          value: "—",
          unit: "headlines",
          observedAt: null,
          tier: "down",
          sourceId: source.id,
          provenancePath: getSourceProvenancePath(source.id),
          note: "News RSS unavailable",
        },
        health: {
          id: source.id,
          name: source.name,
          category: source.category,
          tier: "down",
          lastSuccessAt: null,
          lastCheckedAt: checkedAt,
          error: error instanceof Error ? error.message : "Unknown error",
          provenancePath: getSourceProvenancePath(source.id),
        },
      },
    };
  }
}

async function buildCseData(checkedAt: string): Promise<{
  metric: PulseMetric;
  health: SourceHealth;
}> {
  const source = getSource(CSE_SOURCE_ID)!;

  try {
    if (isDatabaseConfigured()) {
      const dbObservation = await getLatestObservation(source.id, "cse_aspi");
      if (dbObservation) {
        const tier = computeFreshnessTier(
          dbObservation.observedAt,
          source.cadenceMinutes,
        );
        return {
          metric: {
            id: "cse_aspi",
            label: "ASPI",
            value: dbObservation.value.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            }),
            unit: "pts",
            observedAt: dbObservation.observedAt,
            tier,
            sourceId: source.id,
            provenancePath: getSourceProvenancePath(source.id),
            note: "From ingest cache",
          },
          health: {
            id: source.id,
            name: source.name,
            category: source.category,
            tier,
            lastSuccessAt: dbObservation.observedAt,
            lastCheckedAt: checkedAt,
            error: null,
            provenancePath: getSourceProvenancePath(source.id),
          },
        };
      }
    }

    const snapshot = await buildCseSnapshot();
    return {
      metric: buildCsePulseMetricFromSnapshot(checkedAt, snapshot),
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier: snapshot.tier,
        lastSuccessAt: snapshot.asOf,
        lastCheckedAt: checkedAt,
        error: snapshot.isFallback ? "Seed fallback — CSE API unavailable" : null,
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  } catch (error) {
    return {
      metric: {
        id: "cse_aspi",
        label: "ASPI",
        value: "—",
        unit: "pts",
        observedAt: null,
        tier: "down",
        sourceId: source.id,
        provenancePath: getSourceProvenancePath(source.id),
        note: "CSE market data unavailable",
      },
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier: "down",
        lastSuccessAt: null,
        lastCheckedAt: checkedAt,
        error: error instanceof Error ? error.message : "Unknown error",
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  }
}

async function buildColomboAqiMetric(checkedAt: string): Promise<{
  metric: PulseMetric;
  health: SourceHealth;
}> {
  const environment = await getEnvironmentData();
  const colombo = environment.districts.find(
    (district) => district.slug === "colombo",
  );
  const source =
    getSource(environment.sourceId) ?? getSource("environment_aqi_seed")!;
  const isSeed = environment.sourceId === "environment_aqi_seed";
  const isOpenMeteo = environment.sourceId === "open_meteo_air_quality";
  const tier = computeFreshnessTier(
    environment.asOf,
    source.cadenceMinutes,
    new Date(checkedAt).getTime(),
  );

  let note = "Colombo reading unavailable";
  if (isSeed) {
    note = "Seed — not a live sensor reading";
  } else if (colombo != null) {
    note = isOpenMeteo
      ? `PM2.5 ${colombo.pm25} · ${colombo.band.replace(/_/g, " ")} · Open-Meteo model`
      : `PM2.5 ${colombo.pm25} · ${colombo.band.replace(/_/g, " ")}`;
  }

  return {
    metric: {
      id: "aqi_colombo",
      label: "Colombo AQI",
      value: colombo != null ? String(colombo.aqi) : "—",
      unit: "AQI",
      observedAt: environment.asOf,
      tier,
      sourceId: source.id,
      provenancePath: getSourceProvenancePath(source.id),
      note,
    },
    health: {
      id: source.id,
      name: source.name,
      category: source.category,
      tier,
      lastSuccessAt: environment.asOf,
      lastCheckedAt: checkedAt,
      error: null,
      provenancePath: getSourceProvenancePath(source.id),
    },
  };
}

/**
 * Per-upstream build budget for the pulse snapshot (pre-launch F13).
 * Each builder races its work against PULSE_BUILD_TIMEOUT_MS; the losers
 * reject, Promise.allSettled collects the outcomes, and pickPulseResult
 * substitutes a "down" contribution. A single hanging upstream can therefore
 * never stall /api/v1/pulse again.
 */
const PULSE_BUILD_TIMEOUT_MS = 8_000;

function racePulseBuild<T>(label: string, work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error(
            `${label} exceeded ${PULSE_BUILD_TIMEOUT_MS}ms build budget`,
          ),
        ),
      PULSE_BUILD_TIMEOUT_MS,
    );
  });
  // work.finally clears the timer on settle; the race already has handlers
  // attached, so a late rejection after a timeout can never go unhandled.
  return Promise.race([work.finally(() => clearTimeout(timer)), timeout]);
}

function downPulseSource(
  sourceId: string,
  checkedAt: string,
  error: string,
): SourceHealth {
  const source = getSource(sourceId)!;
  return {
    id: source.id,
    name: source.name,
    category: source.category,
    tier: "down",
    lastSuccessAt: null,
    lastCheckedAt: checkedAt,
    error,
    provenancePath: getSourceProvenancePath(source.id),
  };
}

function downPulseMetric(
  id: string,
  label: string,
  sourceId: string,
  note: string,
): PulseMetric {
  return {
    id,
    label,
    value: "—",
    observedAt: null,
    tier: "down",
    sourceId,
    provenancePath: getSourceProvenancePath(sourceId),
    note,
  };
}

function pickPulseResult<T>(
  result: PromiseSettledResult<T>,
  label: string,
  fallback: T,
): T {
  if (result.status === "fulfilled") {
    return result.value;
  }
  console.error(
    `[pulse] ${label} failed — serving fallback:`,
    result.reason instanceof Error ? result.reason.message : result.reason,
  );
  return fallback;
}

export async function buildPulseSnapshot(): Promise<PulseSnapshot> {
  const checkedAt = new Date().toISOString();

  // Pre-launch F13: /api/v1/pulse was observed hanging ~37s because a single
  // slow upstream stalled the whole Promise.all. Every builder now races
  // against an 8s budget; on timeout (or any throw) we fail fast to a
  // "down" contribution, so one slow source can never stall the public API.
  const settled = await Promise.allSettled([
    racePulseBuild("fuel", buildFuelMetrics(checkedAt)),
    racePulseBuild("flood", buildFloodData(checkedAt)),
    racePulseBuild("fx", buildFxMetric(checkedAt)),
    racePulseBuild("weather", buildWeatherPulseMetric(checkedAt)),
    racePulseBuild("power", buildPowerPulseMetric(checkedAt)),
    racePulseBuild("news", buildNewsData(checkedAt)),
    racePulseBuild("cse", buildCseData(checkedAt)),
    racePulseBuild("property", getPropertyData()),
    racePulseBuild("vehicle", getVehicleData()),
    racePulseBuild("aqi", buildColomboAqiMetric(checkedAt)),
  ]);

  const fuel = pickPulseResult(
    settled[0],
    "fuel",
    {
      metrics: [],
      health: downPulseSource(
        "octane_fuel",
        checkedAt,
        "Upstream timeout — Octane API unavailable",
      ),
    },
  );
  const flood = pickPulseResult(
    settled[1],
    "flood",
    {
      flood: [],
      health: downPulseSource(
        "lk_flood_api",
        checkedAt,
        "Upstream timeout — flood API unavailable",
      ),
    },
  );
  const fx = pickPulseResult(settled[2], "fx", {
    metric: {
      id: "usd_lkr",
      label: "USD / LKR",
      value: FX_FALLBACK_RATE.toFixed(2),
      unit: "LKR",
      observedAt: FX_FALLBACK_DATE,
      tier: computeFreshnessTier(
        FX_FALLBACK_DATE,
        getSource("cbsl_fx")!.cadenceMinutes,
      ),
      sourceId: "cbsl_fx",
      provenancePath: getSourceProvenancePath("cbsl_fx"),
      note: "Fallback value — CBSL scrape unavailable (timeout)",
    },
    health: downPulseSource(
      "cbsl_fx",
      checkedAt,
      "Upstream timeout — CBSL scrape unavailable",
    ),
  });
  const weather = pickPulseResult(settled[3], "weather", {
    metric: downPulseMetric(
      "weather_colombo",
      "Colombo weather",
      "open_meteo",
      "Weather unavailable (timeout)",
    ),
    health: downPulseSource(
      "open_meteo",
      checkedAt,
      "Upstream timeout — Open-Meteo unavailable",
    ),
  });
  const power = pickPulseResult(settled[4], "power", {
    metric: downPulseMetric(
      "power_status",
      "Power status",
      "ceb_power",
      "Power status unavailable (timeout)",
    ),
    health: downPulseSource(
      "ceb_power",
      checkedAt,
      "Upstream timeout — power data unavailable",
    ),
  });
  const news = pickPulseResult(settled[5], "news", { contribution: null });
  const cse = pickPulseResult(settled[6], "cse", {
    metric: {
      ...downPulseMetric(
        "cse_aspi",
        "ASPI",
        CSE_SOURCE_ID,
        "CSE market data unavailable (timeout)",
      ),
      unit: "pts",
    },
    health: downPulseSource(
      CSE_SOURCE_ID,
      checkedAt,
      "Upstream timeout — CSE API unavailable",
    ),
  });
  const propertySnapshot = pickPulseResult<PropertySnapshot>(
    settled[7],
    "property",
    {
      sourceId: "propertylk_seed",
      sourceName: "PropertyLK (seed)",
      asOf: checkedAt,
      unit: "perch",
      currency: "LKR",
      districts: [],
    },
  );
  const vehicleSnapshot = pickPulseResult<VehicleSnapshot>(
    settled[8],
    "vehicle",
    {
      sourceId: "vehicle_platform_seed",
      sourceName: "Vehicle Platform (seed)",
      asOf: checkedAt,
      totalListings: 0,
      avgPriceLkr: 0,
      goodDealsCount: 0,
      sourceCount: 0,
      popularMakes: [],
      districts: [],
    },
  );
  const aqi = pickPulseResult(settled[9], "aqi", {
    metric: {
      ...downPulseMetric(
        "aqi_colombo",
        "Colombo AQI",
        "environment_aqi_seed",
        "Colombo reading unavailable (timeout)",
      ),
      unit: "AQI",
    },
    health: downPulseSource(
      "environment_aqi_seed",
      checkedAt,
      "Upstream timeout — AQI unavailable",
    ),
  });

  const normalStations =
    flood.flood.find((item) => item.alertLevel === "NORMAL")?.count ?? 0;
  const totalStations = flood.flood.reduce((sum, item) => sum + item.count, 0);

  const colomboProperty = propertySnapshot.districts.find(
    (district) => district.slug === "colombo",
  );
  const propertySource =
    getSource(propertySnapshot.sourceId) ?? getSource("propertylk_seed")!;

  const colomboVehicle = vehicleSnapshot.districts.find(
    (district) => district.slug === "colombo",
  );
  const vehicleSource =
    getSource(vehicleSnapshot.sourceId) ?? getSource("vehicle_platform_seed")!;

  const metrics: PulseMetric[] = [
    fx.metric,
    ...fuel.metrics,
    weather.metric,
    power.metric,
    cse.metric,
    ...(colomboProperty
      ? [
          {
            id: "property_colombo_median",
            label: "Colombo land (median)",
            value: formatPropertyPrice(colomboProperty.medianPerPerch),
            unit: "LKR/perch",
            observedAt: propertySnapshot.asOf,
            tier: computeFreshnessTier(
              propertySnapshot.asOf,
              propertySource.cadenceMinutes,
            ),
            sourceId: propertySource.id,
            provenancePath: getSourceProvenancePath(propertySource.id),
            note:
              propertySnapshot.sourceId === "propertylk_seed"
                ? "Seed fallback — live PropertyLK API unavailable"
                : `National median LKR ${formatPropertyPrice(
                    propertySnapshot.districts
                      .map((district) => district.medianPerPerch)
                      .sort((a, b) => a - b)[
                      Math.floor(propertySnapshot.districts.length / 2)
                    ] ?? 0,
                  )}/perch`,
          } satisfies PulseMetric,
        ]
      : []),
    ...(colomboVehicle
      ? [
          {
            id: "vehicle_colombo_median",
            label: "Colombo vehicles (median)",
            value: formatVehiclePrice(colomboVehicle.medianPriceLkr),
            unit: "LKR",
            observedAt: vehicleSnapshot.asOf,
            tier: computeFreshnessTier(
              vehicleSnapshot.asOf,
              vehicleSource.cadenceMinutes,
            ),
            sourceId: vehicleSource.id,
            provenancePath: getSourceProvenancePath(vehicleSource.id),
            note: `${vehicleSnapshot.totalListings.toLocaleString()} national listings tracked`,
          } satisfies PulseMetric,
        ]
      : []),
    {
      id: "flood_stations",
      label: "River Stations",
      value: String(totalStations),
      unit: "monitoring",
      observedAt: flood.health.lastSuccessAt,
      tier: flood.health.tier,
      sourceId: flood.health.id,
      provenancePath: flood.health.provenancePath,
      note: `${normalStations} stations reporting normal levels`,
    },
    aqi.metric,
    ...(news.contribution ? [news.contribution.metric] : []),
  ];

  const snapshot: PulseSnapshot = {
    generatedAt: checkedAt,
    metrics,
    flood: flood.flood,
    sources: [
      fx.health,
      fuel.health,
      flood.health,
      weather.health,
      power.health,
      cse.health,
      aqi.health,
      ...(news.contribution ? [news.contribution.health] : []),
    ],
  };

  if (isDatabaseConfigured()) {
    savePulseSnapshot(snapshot).catch(() => {
      // Non-blocking persistence
    });
  }

  return snapshot;
}

export async function buildHealthSnapshot(): Promise<SourceHealth[]> {
  const snapshot = await buildPulseSnapshot();
  return snapshot.sources;
}
