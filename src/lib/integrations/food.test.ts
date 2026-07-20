import assert from "node:assert/strict";
import {
  flattenFoodLkMetrics,
  foodLkPayloadHasMetrics,
} from "./food";

// hub/summary nests counts under coverage — must flatten before metric checks.
const hubHealthy = {
  platform: "food",
  coverage: {
    market_quotes_count: 1200,
    offers_count: 240,
    sources_count: 4,
    categories_count: 8,
  },
};

assert.equal(foodLkPayloadHasMetrics(hubHealthy), true);
assert.equal(flattenFoodLkMetrics(hubHealthy).offers_count, 240);

const hubEmpty = {
  platform: "food",
  coverage: {
    market_quotes_count: 0,
    offers_count: 0,
    sources_count: 0,
    categories_count: 0,
  },
};
assert.equal(
  foodLkPayloadHasMetrics(hubEmpty),
  false,
  "zero coverage must not stamp FoodLK live",
);

const httpErrorShell = { detail: "Internal Server Error" };
assert.equal(foodLkPayloadHasMetrics(httpErrorShell), false);

const basketLive = {
  preset: { id: "essentials", label: "Essentials" },
  summary: { total_lkr: 8650, available_items: 6, missing_items: 0 },
  items: [
    { label: "Rice", price_lkr: 320, source: "market" },
    { label: "Dhal", price_lkr: 420, source: "retail" },
  ],
};
assert.equal(foodLkPayloadHasMetrics(basketLive), true);

const basketEmpty = {
  preset: { id: "essentials", label: "Essentials" },
  summary: { total_lkr: 0, available_items: 0, missing_items: 6 },
  items: [
    { label: "Rice", price_lkr: null, source: null },
    { label: "Dhal", price_lkr: null, source: null },
  ],
};
assert.equal(
  foodLkPayloadHasMetrics(basketEmpty),
  false,
  "empty essentials basket must fail cleanly to WFP",
);

console.log("food.test.ts passed");
