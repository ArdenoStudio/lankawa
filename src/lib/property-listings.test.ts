import assert from "node:assert/strict";
import {
  buildListingCountSeries,
  listingCountDeltaPct,
  sumDistrictListingCounts,
} from "./property-listings";
import type { PropertySnapshot } from "./types";

const snapshot: PropertySnapshot = {
  sourceId: "propertylk_api",
  sourceName: "PropertyLK",
  asOf: "2026-07-18",
  unit: "perch",
  currency: "LKR",
  districts: [
    {
      slug: "colombo",
      medianPerPerch: 1,
      lowBand: 1,
      highBand: 1,
      medianPerSqFt: 1,
      trendPct: 0,
      listingCount: 100,
    },
    {
      slug: "kandy",
      medianPerPerch: 1,
      lowBand: 1,
      highBand: 1,
      medianPerSqFt: 1,
      trendPct: 0,
      listingCount: 50,
    },
  ],
};

assert.equal(sumDistrictListingCounts(snapshot), 150);

const built = buildListingCountSeries(snapshot);
assert.equal(built.listingCount, 150);
assert.equal(built.isSeed, false);
assert.ok(built.series.length >= 2);
assert.equal(built.series[built.series.length - 1].value, 150);

const delta = listingCountDeltaPct([
  { date: "2026-06-01", value: 100 },
  { date: "2026-07-01", value: 110 },
]);
assert.ok(delta != null);
assert.equal(Number(delta.toFixed(1)), 10);

console.log("property-listings test passed");
