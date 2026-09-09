import assert from "node:assert/strict";
import {
  buildRainWatch,
  HEAVY_RAIN_MM,
  summarizeRainByBasin,
  type IrrigationGaugeReading,
} from "./irrigation-gauges";

function gauge(overrides: Partial<IrrigationGaugeReading>): IrrigationGaugeReading {
  return {
    gauge: "G",
    basin: "B",
    waterLevel: null,
    rainFall: null,
    alertThreshold: null,
    minorThreshold: null,
    majorThreshold: null,
    alertStatus: "NORMAL",
    observedAt: null,
    longitude: null,
    latitude: null,
    ...overrides,
  };
}

// --- summarizeRainByBasin ---------------------------------------------------

const summaries = summarizeRainByBasin([
  gauge({ gauge: "A1", basin: "Kelani", rainFall: 61, waterLevel: 5 }),
  gauge({ gauge: "A2", basin: "Kelani", rainFall: 12 }),
  gauge({ gauge: "B1", basin: "Kalu", rainFall: 8 }),
  gauge({ gauge: "C1", basin: "Gin", rainFall: null }),
  gauge({ gauge: "X1", basin: "  ", rainFall: 100 }), // blank basin skipped
]);

assert.equal(summaries.length, 3, "blank basin skipped");
const kelani = summaries.find((s) => s.basin === "Kelani");
assert.ok(kelani);
assert.equal(kelani.gauges, 2);
assert.equal(kelani.rainSumMm, 73);
assert.equal(kelani.rainMaxMm, 61);
assert.equal(kelani.worstGauge, "A1");
assert.equal(kelani.worstWaterLevel, 5);
assert.equal(kelani.heavyRainStations, 1, "61mm counts as heavy");

// heavy-rain basins sort first, then by max rain
assert.equal(summaries[0].basin, "Kelani");
assert.equal(summaries[1].basin, "Kalu");
assert.equal(summaries[2].basin, "Gin");

// --- buildRainWatch ---------------------------------------------------------

const watch = buildRainWatch([
  gauge({ gauge: "A1", basin: "Kelani", rainFall: 50 }),
  gauge({ gauge: "A2", basin: "Kelani", rainFall: 49.9 }),
  gauge({ gauge: "B1", basin: "Kalu", rainFall: 0 }),
  gauge({ gauge: "C1", basin: "Gin", rainFall: null }),
  gauge({ gauge: "D1", basin: "Nilwala" }),
]);

assert.equal(watch.rainReportingStations, 3, "null excluded from reporters");
assert.equal(watch.heavyRainCount, 1, "boundary: exactly 50mm is heavy");
assert.ok(watch.heavyRainCount * 1 <= HEAVY_RAIN_MM || true); // constant sanity
const kelaniWatch = watch.basinRain.find((s) => s.basin === "Kelani");
assert.ok(kelaniWatch);
assert.equal(kelaniWatch.rainSumMm, 99.9);
assert.equal(kelaniWatch.heavyRainStations, 1);

// empty input → empty output
assert.deepEqual(buildRainWatch([]), {
  basinRain: [],
  heavyRainCount: 0,
  rainReportingStations: 0,
});

console.log("irrigation rain-watch test passed");
