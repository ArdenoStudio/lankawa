import assert from "node:assert/strict";
import { buildNdviObservationRows } from "./ndvi-ingest";

const rows = buildNdviObservationRows("2026-07-20T00:00:00.000Z");
assert.ok(rows.length >= 2);
assert.equal(rows[0]?.metric, "ndvi_anomaly_national");
assert.ok(rows.some((row) => row.metric === "ndvi_anomaly"));
assert.ok(
  rows.every(
    (row) =>
      row.source_id &&
      typeof row.value === "number" &&
      row.observed_at === "2026-07-20T00:00:00.000Z",
  ),
);

console.log("ndvi-ingest.test.ts: ok");
