import assert from "node:assert/strict";
import { computeFxAnomaly } from "./fx-anomaly";

const quiet = computeFxAnomaly([
  { date: "2026-07-01", sellRate: 300 },
  { date: "2026-07-02", sellRate: 300.1 },
  { date: "2026-07-03", sellRate: 300.05 },
  { date: "2026-07-04", sellRate: 300.15 },
  { date: "2026-07-05", sellRate: 300.2 },
  { date: "2026-07-06", sellRate: 300.25 },
]);
assert.equal(quiet.unusual, false);

const spike = computeFxAnomaly([
  { date: "2026-07-01", sellRate: 300 },
  { date: "2026-07-02", sellRate: 300.1 },
  { date: "2026-07-03", sellRate: 300.05 },
  { date: "2026-07-04", sellRate: 300.15 },
  { date: "2026-07-05", sellRate: 300.2 },
  { date: "2026-07-06", sellRate: 305.0 },
]);
assert.equal(spike.unusual, true);
assert.ok((spike.absDelta ?? 0) > 4);

const thin = computeFxAnomaly([
  { date: "2026-07-01", sellRate: 300 },
  { date: "2026-07-02", sellRate: 302 },
]);
assert.equal(thin.unusual, true);

console.log("fx-anomaly.test.ts: ok");
