import assert from "node:assert/strict";
import {
  mapAffectedAreaToDistricts,
  powerConcentrationByDistrict,
} from "./power-concentration";

assert.deepEqual(mapAffectedAreaToDistricts("Colombo City North"), ["colombo"]);
assert.ok(mapAffectedAreaToDistricts("Kalutara Area 3").includes("kalutara"));
assert.ok(mapAffectedAreaToDistricts("Nuwara Eliya feeder").includes("nuwara-eliya"));

const ranked = powerConcentrationByDistrict([
  "Colombo City",
  "Colombo South",
  "Gampaha Area",
  "Unknown feeder XYZ",
]);
assert.equal(ranked[0]?.slug, "colombo");
assert.equal(ranked[0]?.mentions, 2);
assert.equal(ranked[1]?.slug, "gampaha");
assert.equal(ranked[1]?.mentions, 1);

console.log("power-concentration.test.ts: ok");
