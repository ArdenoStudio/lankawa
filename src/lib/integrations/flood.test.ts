import assert from "node:assert/strict";
import {
  areFloodLevelsStale,
  FLOOD_LEVELS_STALE_MS,
  preferIrrigationWhenFloodStale,
} from "./flood";
import type { FloodStationLevel } from "../types";
import type { IrrigationGaugeReading } from "./irrigation-gauges";

const NOW = Date.parse("2026-07-20T12:00:00.000Z");

function level(
  overrides: Partial<FloodStationLevel> = {},
): FloodStationLevel {
  return {
    stationName: "Peradeniya",
    riverName: "Mahaweli Ganga",
    waterLevel: 1.7,
    alertStatus: "NORMAL",
    remarks: "",
    timestamp: "2026-07-20T11:00:00.000Z",
    ...overrides,
  };
}

assert.equal(areFloodLevelsStale([], NOW), true);
assert.equal(
  areFloodLevelsStale([level({ timestamp: "" })], NOW),
  true,
);
assert.equal(
  areFloodLevelsStale(
    [level({ timestamp: "2026-07-20T11:30:00.000Z" })],
    NOW,
  ),
  false,
);
assert.equal(
  areFloodLevelsStale(
    [
      level({
        timestamp: new Date(NOW - FLOOD_LEVELS_STALE_MS - 1).toISOString(),
      }),
    ],
    NOW,
  ),
  true,
);

const freshFlood = [level({ timestamp: "2026-07-20T11:45:00.000Z" })];
const staleFlood = [
  level({ timestamp: "2026-07-11T09:30:00.000Z", waterLevel: 2 }),
];

const liveIrrigationGauge = {
  gauge: "Glencourse",
  basin: "Kelani Ganga",
  waterLevel: 9.1,
  rainFall: 0,
  alertThreshold: 15,
  minorThreshold: 16.5,
  majorThreshold: 19,
  alertStatus: "NORMAL" as const,
  observedAt: "2026-07-20T11:50:00.000Z",
  longitude: 80.19,
  latitude: 6.97,
} satisfies IrrigationGaugeReading;

assert.deepEqual(
  preferIrrigationWhenFloodStale(freshFlood, {
    isSeed: false,
    gauges: [liveIrrigationGauge],
  }, NOW),
  freshFlood,
);

assert.deepEqual(
  preferIrrigationWhenFloodStale(staleFlood, {
    isSeed: true,
    gauges: [liveIrrigationGauge],
  }, NOW),
  staleFlood,
);

const preferred = preferIrrigationWhenFloodStale(
  staleFlood,
  { isSeed: false, gauges: [liveIrrigationGauge] },
  NOW,
);
assert.equal(preferred.length, 1);
assert.equal(preferred[0]?.stationName, "Glencourse");
assert.equal(preferred[0]?.riverName, "Kelani Ganga");
assert.equal(preferred[0]?.waterLevel, 9.1);
assert.equal(preferred[0]?.timestamp, "2026-07-20T11:50:00.000Z");

console.log("flood.test.ts: ok");
