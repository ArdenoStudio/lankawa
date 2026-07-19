import assert from "node:assert/strict";
import { estimateDomesticBill, getPucslTariffSnapshot } from "./pucsl";

const snapshot = getPucslTariffSnapshot();
assert.equal(snapshot.sourceId, "pucsl_tariff");
assert.ok(snapshot.tracks.length >= 2);

const low = estimateDomesticBill(25);
assert.ok(low);
assert.equal(low.trackId, "upto_60");
assert.equal(low.energyLkr, 25 * 4.5);
assert.equal(low.fixedLkr, 80);

const mid = estimateDomesticBill(45);
assert.ok(mid);
assert.equal(mid.trackId, "upto_60");
assert.equal(mid.energyLkr, 30 * 4.5 + 15 * 8);
assert.equal(mid.fixedLkr, 210);

const high = estimateDomesticBill(100);
assert.ok(high);
assert.equal(high.trackId, "above_60");
assert.equal(
  high.energyLkr,
  Number((60 * 12.75 + 30 * 18.5 + 10 * 24).toFixed(2)),
);
assert.equal(high.fixedLkr, 1000);

assert.equal(estimateDomesticBill(-1), null);

console.log("pucsl tariff estimate test passed");
