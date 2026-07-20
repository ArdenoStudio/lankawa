import assert from "node:assert/strict";
import {
  estimateWaterBill,
  getNwsdbTariffSnapshot,
  parseLiveBillCalculator,
} from "./nwsdb";

const snapshot = getNwsdbTariffSnapshot();
assert.equal(snapshot.sourceId, "nwsdb_tariff");
assert.ok(snapshot.tracks.length >= 2);
assert.equal(snapshot.vatRatePct, 18);

const domestic = estimateWaterBill(20, "domestic");
assert.ok(domestic);
assert.equal(domestic.trackId, "domestic");
assert.equal(domestic.usageLkr, 1750);
assert.equal(domestic.serviceLkr, 400);
assert.equal(domestic.vatLkr, 387);
assert.equal(domestic.totalLkr, 2537);
assert.equal(domestic.mode, "seed");

const low = estimateWaterBill(5, "domestic");
assert.ok(low);
assert.equal(low.usageLkr, 300);
assert.equal(low.serviceLkr, 300);
assert.equal(low.vatLkr, 108);
assert.equal(low.totalLkr, 708);

const high = estimateWaterBill(120, "domestic");
assert.ok(high);
assert.equal(high.usageLkr, 25850);
assert.equal(high.serviceLkr, 4500);
assert.equal(high.vatLkr, 5463);
assert.equal(high.totalLkr, 35813);

const samurdhi = estimateWaterBill(20, "samurdhi");
assert.ok(samurdhi);
assert.equal(samurdhi.usageLkr, 350);
assert.equal(samurdhi.serviceLkr, 100);
assert.equal(samurdhi.vatLkr, 81);
assert.equal(samurdhi.totalLkr, 531);

assert.equal(estimateWaterBill(-1), null);

const live = parseLiveBillCalculator(
  {
    Calculation: {
      UsageCharge: 1750,
      ServiceCharge: 400,
      BillVAT: 387,
      TotalAmount: 2537,
    },
    Tariff: [],
  },
  20,
  "domestic",
  30,
);
assert.ok(live);
assert.equal(live.mode, "live");
assert.equal(live.totalLkr, 2537);

assert.equal(parseLiveBillCalculator({ error: true }, 20, "domestic", 30), null);

console.log("nwsdb water bill estimate test passed");
