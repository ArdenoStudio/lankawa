import assert from "node:assert/strict";
import { mapPriceMonitorStaples } from "./food-price-monitor";

const payload = {
  generated: "2026-07-25T15:08:07",
  source: "Central Bank of Sri Lanka - Daily Price Report",
  dates: ["2026-07-23", "2026-07-24", "2026-07-25"],
  commodities: [
    {
      name: "Coconut (Avg.)",
      category: "Other",
      unit: "Rs./nut",
      primaryMarket: "Dambulla",
      series: [120, 125, 130],
    },
    {
      name: "Red Dhal",
      primaryMarket: "Pettah",
      series: [400, 410, 420],
    },
    {
      name: "Sugar (White)",
      primaryMarket: "Pettah",
      series: [280, 285, 290],
    },
    {
      name: "Big Onion (Local)",
      primaryMarket: "Dambulla",
      series: [200, null, 210],
    },
    {
      name: "Egg (White)",
      primaryMarket: "Negombo",
      series: [40, 42, 45],
    },
    {
      name: "Beans",
      primaryMarket: "Dambulla",
      series: [300, 310, 320],
    },
  ],
};

const mapped = mapPriceMonitorStaples(payload);
assert.ok(mapped);
assert.equal(mapped.sourceId, "cbsl_price_monitor");
assert.equal(mapped.corpusAsOf, "2026-07-25");
assert.ok(mapped.stapleItems.length >= 4);

const coconut = mapped.stapleItems.find((item) => item.slug === "coconut");
assert.ok(coconut);
assert.equal(coconut.priceLkr, 130);
assert.equal(coconut.unit, "each");

const onion = mapped.stapleItems.find((item) => item.slug === "big-onion");
assert.ok(onion);
assert.equal(onion.priceLkr, 210);

assert.equal(mapPriceMonitorStaples({ dates: [], commodities: [] }), null);
assert.equal(
  mapPriceMonitorStaples({
    dates: ["2026-07-25"],
    commodities: [{ name: "Beans", series: [100] }],
  }),
  null,
  "fewer than 3 staples must fail cleanly",
);

console.log("food-price-monitor.test.ts: ok");
