import type { PulseMetric } from "./types";

/** Metrics shown on the Home Today strip. `aqi_colombo` only appears when fresh. */
export const TODAY_METRIC_IDS = [
  "usd_lkr",
  "fuel_petrol_92",
  "fuel_diesel",
  "weather_colombo",
  "power_status",
  "flood_stations",
  "aqi_colombo",
] as const;

const TODAY_FRESH_ONLY_IDS = new Set<string>(["aqi_colombo"]);

export function getTodayPulseMetrics(metrics: PulseMetric[]): PulseMetric[] {
  return TODAY_METRIC_IDS.map((id) => metrics.find((metric) => metric.id === id))
    .filter((metric): metric is PulseMetric => metric != null)
    .filter(
      (metric) =>
        !TODAY_FRESH_ONLY_IDS.has(metric.id) || metric.tier === "fresh",
    );
}
