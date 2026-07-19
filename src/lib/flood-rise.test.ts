import assert from "node:assert/strict";
import { computeStationRiseRate } from "./flood-rise";

const rising = computeStationRiseRate([
  { timestamp: "2026-07-19T08:00:00Z", waterLevel: 2.0 },
  { timestamp: "2026-07-19T11:00:00Z", waterLevel: 2.3 },
]);
assert.ok(rising != null);
assert.ok(rising! > 5);

const flat = computeStationRiseRate([
  { timestamp: "2026-07-19T08:00:00Z", waterLevel: 2.0 },
  { timestamp: "2026-07-19T11:00:00Z", waterLevel: 2.01 },
]);
assert.ok(flat != null);
assert.ok(flat! < 5);

assert.equal(computeStationRiseRate([]), null);

console.log("flood-rise.test.ts: ok");
