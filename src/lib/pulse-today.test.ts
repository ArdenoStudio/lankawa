import assert from "node:assert/strict";
import { getTodayPulseMetrics, TODAY_METRIC_IDS } from "./pulse-today";
import type { PulseMetric } from "./types";

assert.ok(TODAY_METRIC_IDS.includes("aqi_colombo"));

function metric(
  id: string,
  tier: PulseMetric["tier"] = "fresh",
): PulseMetric {
  return {
    id,
    label: id,
    value: "1",
    observedAt: "2026-07-20T00:00:00.000Z",
    tier,
    sourceId: "test",
    provenancePath: "/sources/test",
  };
}

const metrics = [
  metric("usd_lkr"),
  metric("fuel_petrol_92"),
  metric("fuel_diesel"),
  metric("weather_colombo"),
  metric("power_status"),
  metric("flood_stations"),
  metric("aqi_colombo", "stale"),
];

const today = getTodayPulseMetrics(metrics);
assert.equal(
  today.some((item) => item.id === "aqi_colombo"),
  false,
);

const withFresh = getTodayPulseMetrics([
  ...metrics.filter((item) => item.id !== "aqi_colombo"),
  metric("aqi_colombo", "fresh"),
]);
assert.equal(
  withFresh.some((item) => item.id === "aqi_colombo"),
  true,
);

console.log("pulse today test passed");
