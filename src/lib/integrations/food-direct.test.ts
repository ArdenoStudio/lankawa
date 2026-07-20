import assert from "node:assert/strict";
import {
  buildWfpFoodSnapshot,
  parseWfpFoodPricesCsv,
} from "./food-direct";

/**
 * Synthetic WFP HDX CSV fixture.
 * - Corpus tip: 2025-08-15
 * - White rice + red nadu both present (prefer white)
 * - Eggs present
 * - Sugar / wheat flour quotes far behind tip (stale; excluded from basket)
 * - Fuel diesel/petrol rows that must never become staples
 */
const FIXTURE_CSV = `date,admin1,admin2,market,market_id,latitude,longitude,category,commodity,commodity_id,unit,priceflag,pricetype,currency,price,usdprice
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,cereals and tubers,Rice (white),50,KG,actual,Retail,LKR,270.5,0.9
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,cereals and tubers,Rice (red nadu),51,KG,actual,Retail,LKR,240,0.8
2024-02-01,Western,Colombo,Colombo City,368,6.93,79.85,cereals and tubers,Wheat flour,58,KG,actual,Retail,LKR,310,1.03
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,pulses and nuts,Lentils,60,KG,actual,Retail,LKR,420,1.4
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,vegetables and fruits,Onions (red),70,KG,actual,Wholesale,LKR,280,0.93
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,vegetables and fruits,Coconut,80,Unit,actual,Retail,LKR,145,0.48
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,"meat, fish and eggs",Eggs,85,Unit,actual,Retail,LKR,55,0.18
2024-01-10,Western,Colombo,Colombo City,368,6.93,79.85,miscellaneous food,Sugar,90,KG,actual,Retail,LKR,250,0.83
2025-07-15,Western,Colombo,Colombo City,368,6.93,79.85,cereals and tubers,Rice (white),50,KG,actual,Retail,LKR,260,0.87
2025-08-15,Western,Gampaha,Gampaha,369,7.08,80.0,cereals and tubers,Rice (white),50,KG,actual,Retail,LKR,269.5,0.9
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,non-food,Fuel (diesel),99,L,actual,Retail,LKR,310,1.03
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,cereals and tubers,Fuel (petrol),100,L,actual,Retail,LKR,350,1.16
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,non-food,Diesel,101,L,actual,Retail,LKR,305,1.01
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,non-food,Petrol,102,L,actual,Retail,LKR,345,1.15
`;

const rows = parseWfpFoodPricesCsv(FIXTURE_CSV);

// --- 1. Fuel / diesel / petrol never appear in parsed rows or staples ---
assert.ok(
  rows.every((row) => !/fuel|diesel|petrol|gasoline/i.test(row.commodity)),
  "fuel/diesel/petrol rows dropped at parse time",
);
assert.ok(rows.every((row) => !/^non-food/i.test(row.category)));
assert.equal(rows.length, 10);
assert.ok(rows.every((row) => row.price > 0));

const snapshot = buildWfpFoodSnapshot(rows);
assert.ok(snapshot, "expected WFP snapshot from fixture");
assert.equal(snapshot.sourceId, "wfp_hdx");
assert.equal(snapshot.asOf.slice(0, 10), "2025-08-15");
assert.equal(snapshot.corpusAsOf, "2025-08-15");

const stapleNames = snapshot.stapleItems.map((item) => item.name).join(" ");
const stapleSlugs = snapshot.stapleItems.map((item) => item.slug).join(" ");
assert.ok(
  !/fuel|diesel|petrol|gasoline/i.test(stapleNames),
  "fuel/diesel/petrol must never appear in staple names",
);
assert.ok(
  !/fuel|diesel|petrol|gasoline/i.test(stapleSlugs),
  "fuel/diesel/petrol must never appear in staple slugs",
);
assert.ok(
  snapshot.stapleItems.every(
    (item) => !/fuel|diesel|petrol|gasoline/i.test(item.name),
  ),
  "explicit: no fuel/diesel/petrol rows in staples",
);

const slugs = new Set(snapshot.stapleItems.map((item) => item.slug));
assert.ok(slugs.has("rice"));
assert.ok(slugs.has("dhal"));
assert.ok(slugs.has("big-onion"));
assert.ok(slugs.has("coconut"));
assert.ok(slugs.has("sugar"));
assert.ok(slugs.has("wheat"));

// --- 2. Sugar / wheat marked stale when quote date << corpus tip ---
const sugar = snapshot.stapleItems.find((item) => item.slug === "sugar");
assert.ok(sugar);
assert.equal(sugar.stale, true, "sugar quote from 2024 is stale vs corpus tip");
assert.equal(sugar.quoteAsOf, "2024-01-10");
assert.ok(sugar.note && /stale/i.test(sugar.note));

const wheat = snapshot.stapleItems.find((item) => item.slug === "wheat");
assert.ok(wheat);
assert.equal(wheat.stale, true, "wheat quote from 2024 is stale vs corpus tip");
assert.equal(wheat.quoteAsOf, "2024-02-01");
assert.ok(wheat.note && /stale/i.test(wheat.note));
assert.ok(
  (snapshot.staleStapleCount ?? 0) >= 2,
  "staleStapleCount reflects stale sugar and wheat",
);

// --- 3. White rice preferred over red nadu when both present ---
const rice = snapshot.stapleItems.find((item) => item.slug === "rice");
assert.ok(rice);
assert.equal(rice.name, "Rice (white)");
assert.equal(rice.stale, false);
// Mean of Colombo 270.5 and Gampaha 269.5 on corpus tip (not red nadu 240).
assert.equal(rice.priceLkr, 270);
assert.notEqual(rice.priceLkr, 240);

// --- 4. Eggs included when present ---
assert.ok(slugs.has("eggs"), "eggs included when present in CSV");
const eggs = snapshot.stapleItems.find((item) => item.slug === "eggs");
assert.ok(eggs);
assert.equal(eggs.priceLkr, 55);
assert.equal(eggs.stale, false);

// --- 5. Basket excludes all stale staples (sugar, wheat in this fixture) ---
const freshBasket =
  rice.priceLkr * 10 + // rice
  280 * 3 + // onions
  420 * 2 + // lentils
  145 * 8 + // coconut
  eggs.priceLkr * 30; // eggs
// Sugar (250*2) and wheat (310*3) must NOT contribute when stale.
assert.equal(
  snapshot.essentialsBasketLkr,
  Math.round(freshBasket),
  "basket excludes stale sugar/wheat (non-stale staples only)",
);
assert.ok(
  snapshot.essentialsBasketLkr < freshBasket + sugar.priceLkr * 2,
  "stale sugar not added to basket",
);
assert.ok(
  snapshot.essentialsBasketLkr < freshBasket + wheat.priceLkr * 3,
  "stale wheat not added to basket",
);
assert.ok(snapshot.essentialsBasketLkr > 0);

const empty = buildWfpFoodSnapshot([]);
assert.equal(empty, null);

console.log("food-direct.test.ts: ok");
