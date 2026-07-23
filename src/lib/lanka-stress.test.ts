import assert from "node:assert/strict";
import { computeLankaStressIndex } from "./lanka-stress";

const calm = computeLankaStressIndex({
  fxUnusual: false,
  fxMadZ: 0.2,
  fxAbsDelta: 0.1,
  floodElevatedStationCount: 0,
  powerStatus: "Normal supply",
  metWarningActive: false,
  landslideWarningDistricts: 0,
  dengueHighDistricts: 0,
  asOf: "2026-07-23T00:00:00.000Z",
});
assert.equal(calm.tier, "calm");
assert.equal(calm.score, 0);
assert.equal(calm.isPartial, false);
assert.equal(calm.sourceId, "lanka_stress_index");
assert.ok(calm.methodology.length >= 5);

const severe = computeLankaStressIndex({
  fxUnusual: true,
  fxMadZ: 4,
  fxAbsDelta: 5,
  floodElevatedStationCount: 12,
  powerStatus: "Active outages",
  metWarningActive: true,
  landslideWarningDistricts: 8,
  dengueHighDistricts: 6,
  asOf: "2026-07-23T00:00:00.000Z",
});
assert.equal(severe.tier, "severe");
assert.equal(severe.score, 100);
assert.ok(severe.components.every((component) => component.available));

const partial = computeLankaStressIndex({
  fxUnusual: null,
  fxMadZ: null,
  fxAbsDelta: null,
  floodElevatedStationCount: 3,
  powerStatus: "Scheduled interruptions",
  metWarningActive: null,
  landslideWarningDistricts: 2,
  dengueHighDistricts: null,
  asOf: "2026-07-23T00:00:00.000Z",
});
assert.equal(partial.isPartial, true);
assert.ok(partial.score > 0 && partial.score < 100);
assert.ok(
  partial.components.some(
    (component) => component.id === "fx" && !component.available,
  ),
);

const capped = computeLankaStressIndex({
  fxUnusual: true,
  fxMadZ: 10,
  fxAbsDelta: 20,
  floodElevatedStationCount: 100,
  powerStatus: "Active outages",
  metWarningActive: true,
  landslideWarningDistricts: 100,
  dengueHighDistricts: 100,
});
assert.ok(capped.score <= 100);

console.log("lanka-stress.test.ts: ok");
