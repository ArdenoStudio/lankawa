import assert from "node:assert/strict";
import {
  buildWfpFoodSnapshot,
  parseWfpFoodPricesCsv,
} from "./food-direct";

const FIXTURE_CSV = `date,admin1,admin2,market,market_id,latitude,longitude,category,commodity,commodity_id,unit,priceflag,pricetype,currency,price,usdprice
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,cereals and tubers,Rice (white),50,KG,actual,Retail,LKR,270.5,0.9
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,cereals and tubers,Wheat flour,58,KG,actual,Retail,LKR,310,1.03
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,pulses and nuts,Lentils,60,KG,actual,Retail,LKR,420,1.4
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,vegetables and fruits,Onions (red),70,KG,actual,Wholesale,LKR,280,0.93
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,vegetables and fruits,Coconut,80,Unit,actual,Retail,LKR,145,0.48
2025-08-15,Western,Colombo,Colombo City,368,6.93,79.85,miscellaneous food,Sugar,90,KG,actual,Retail,LKR,250,0.83
2025-07-15,Western,Colombo,Colombo City,368,6.93,79.85,cereals and tubers,Rice (white),50,KG,actual,Retail,LKR,260,0.87
2025-08-15,Western,Gampaha,Gampaha,369,7.08,80.0,cereals and tubers,Rice (white),50,KG,actual,Retail,LKR,269.5,0.9
`;

const rows = parseWfpFoodPricesCsv(FIXTURE_CSV);
assert.equal(rows.length, 8);
assert.ok(rows.every((row) => row.price > 0));

const snapshot = buildWfpFoodSnapshot(rows);
assert.ok(snapshot, "expected WFP snapshot from fixture");
assert.equal(snapshot.sourceId, "wfp_hdx");
assert.equal(snapshot.asOf.slice(0, 10), "2025-08-15");
assert.ok(snapshot.essentialsBasketLkr > 0);

const slugs = new Set(snapshot.stapleItems.map((item) => item.slug));
assert.ok(slugs.has("rice"));
assert.ok(slugs.has("dhal"));
assert.ok(slugs.has("big-onion"));
assert.ok(slugs.has("coconut"));
assert.ok(slugs.has("sugar"));
assert.ok(slugs.has("wheat"));

const rice = snapshot.stapleItems.find((item) => item.slug === "rice");
assert.ok(rice);
// Mean of Colombo 270.5 and Gampaha 269.5 on latest retail date.
assert.equal(rice.priceLkr, 270);

const empty = buildWfpFoodSnapshot([]);
assert.equal(empty, null);

console.log("food-direct.test.ts: ok");
