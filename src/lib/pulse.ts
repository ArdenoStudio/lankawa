import { computeFreshnessTier } from "./freshness";
import { getLatestObservation } from "./db";
import { fetchLatestCbslFxRate } from "./integrations/cbsl";
import { fetchFloodAlertSummary } from "./integrations/flood";
import { fetchOctanePrices, pickCpcPrice } from "./integrations/octane";
import { getSource } from "./sources";
import type { PulseMetric, PulseSnapshot, SourceHealth } from "./types";

const FX_FALLBACK_RATE = 302.5;
const FX_FALLBACK_DATE = "2026-07-18T00:00:00.000Z";

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
        sourceUrl: source.url,
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
        sourceUrl: source.url,
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
        sourceUrl: source.url,
      },
    };
  } catch (error) {
    return {
      metrics: [],
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier: "down",
        lastSuccessAt: null,
        lastCheckedAt: checkedAt,
        error: error instanceof Error ? error.message : "Unknown error",
        sourceUrl: source.url,
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
        sourceUrl: source.url,
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
        sourceUrl: source.url,
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
          sourceUrl: source.url,
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
          sourceUrl: source.url,
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
        sourceUrl: source.url,
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
        sourceUrl: source.url,
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
        sourceUrl: source.url,
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
        sourceUrl: source.url,
      },
    };
  }
}

export async function buildPulseSnapshot(): Promise<PulseSnapshot> {
  const checkedAt = new Date().toISOString();
  const [fuel, flood, fx] = await Promise.all([
    buildFuelMetrics(checkedAt),
    buildFloodData(checkedAt),
    buildFxMetric(checkedAt),
  ]);

  const normalStations =
    flood.flood.find((item) => item.alertLevel === "NORMAL")?.count ?? 0;
  const totalStations = flood.flood.reduce((sum, item) => sum + item.count, 0);

  const metrics: PulseMetric[] = [
    fx.metric,
    ...fuel.metrics,
    {
      id: "flood_stations",
      label: "River Stations",
      value: String(totalStations),
      unit: "monitoring",
      observedAt: flood.health.lastSuccessAt,
      tier: flood.health.tier,
      sourceId: flood.health.id,
      sourceUrl: flood.health.sourceUrl,
      note: `${normalStations} stations reporting normal levels`,
    },
  ];

  return {
    generatedAt: checkedAt,
    metrics,
    flood: flood.flood,
    sources: [fx.health, fuel.health, flood.health],
  };
}

export async function buildHealthSnapshot(): Promise<SourceHealth[]> {
  const snapshot = await buildPulseSnapshot();
  return snapshot.sources;
}
