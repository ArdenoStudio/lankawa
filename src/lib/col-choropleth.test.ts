import assert from "node:assert/strict";
import {
  colFillOpacity,
  colShadeBucket,
  maxColIndex,
} from "./col-choropleth";
import type { CostOfLivingDistrict } from "./types";

const districts: CostOfLivingDistrict[] = [
  {
    slug: "colombo",
    index: 100,
    fuelComponent: 100,
    propertyComponent: 100,
    foodBasketLkr: 70000,
    rank: 1,
  },
  {
    slug: "monaragala",
    index: 20,
    fuelComponent: 100,
    propertyComponent: 10,
    foodBasketLkr: 30000,
    rank: 25,
  },
];

assert.equal(maxColIndex(districts), 100);
assert.ok(colFillOpacity(100, 100) > colFillOpacity(20, 100));
assert.equal(colShadeBucket(100, 100), 4);
assert.equal(colShadeBucket(0, 100), 0);
assert.ok(colFillOpacity(NaN, 100) <= 0.1);

console.log("col-choropleth.test.ts: ok");
