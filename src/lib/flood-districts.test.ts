import assert from "node:assert/strict";
import {
  floodAttentionByDistrict,
  floodDistrictOpacity,
  getDistrictForFloodStation,
} from "./flood-districts";
import type { FloodAlertSummary } from "./types";

assert.equal(getDistrictForFloodStation("Nagalagam Street"), "colombo");
assert.equal(getDistrictForFloodStation("Rathnapura"), "ratnapura");
assert.equal(getDistrictForFloodStation("Unknown Station"), undefined);

const quiet: FloodAlertSummary[] = [
  { alertLevel: "NORMAL", count: 12, stations: ["Nagalagam Street", "Hanwella"] },
];
assert.equal(floodAttentionByDistrict(quiet).size, 0);

const fixtures: FloodAlertSummary[] = [
  {
    alertLevel: "ALERT",
    count: 2,
    stations: ["Nagalagam Street", "Rathnapura"],
  },
  {
    alertLevel: "WARNING",
    count: 1,
    stations: ["Ellagawa"],
  },
  {
    alertLevel: "NORMAL",
    count: 5,
    stations: ["Peradeniya"],
  },
];

const attention = floodAttentionByDistrict(fixtures);
assert.equal(attention.get("colombo")?.stationCount, 1);
assert.equal(attention.get("colombo")?.maxAlertLevel, "ALERT");
assert.equal(attention.get("ratnapura")?.stationCount, 2);
assert.equal(attention.get("ratnapura")?.maxAlertLevel, "WARNING");
assert.equal(attention.has("kandy"), false);

assert.ok(floodDistrictOpacity("WARNING") > floodDistrictOpacity("ALERT"));
assert.ok(floodDistrictOpacity("MAJOR") > floodDistrictOpacity("WARNING"));
assert.equal(floodDistrictOpacity(undefined), 0.08);

console.log("flood-districts.test.ts: ok");
