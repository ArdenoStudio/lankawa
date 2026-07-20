import assert from "node:assert/strict";
import {
  getHydroShareSeries,
  getPucslGenerationMix,
  primaryMixLabel,
} from "./pucsl-generation";

const snapshot = getPucslGenerationMix();
assert.equal(snapshot.sourceId, "pucsl_generation");
assert.ok(snapshot.mix.length >= 3);
assert.ok(snapshot.isSeed);

const series = getHydroShareSeries(snapshot);
assert.ok(series.length >= 2);
assert.ok(series.every((point) => Number.isFinite(point.value)));

const primary = primaryMixLabel(snapshot);
assert.ok(primary);
assert.ok(primary.sharePct > 0);

console.log("pucsl-generation test passed");
