import assert from "node:assert/strict";
import {
  buildSparRetailSnapshot,
  isReasonableStaplePrice,
  packKgFromTitle,
} from "./food-spar";

const FIXTURE = {
  products: [
    {
      title: "Keeri Samba Rice 5kg",
      updated_at: "2026-07-18T10:00:00+05:30",
      variants: [{ price: "1450.00", available: true }],
    },
    {
      title: "Red Dhal 1kg",
      updated_at: "2026-07-18T09:00:00+05:30",
      variants: [{ price: "410.00", available: true }],
    },
    {
      title: "Big Onion 1kg",
      updated_at: "2026-07-17T12:00:00+05:30",
      variants: [{ price: "280.00", available: true }],
    },
    {
      title: "White Sugar 1kg",
      updated_at: "2026-07-16T08:00:00+05:30",
      variants: [{ price: "255.00", available: true }],
    },
    {
      title: "Fresh Coconut",
      updated_at: "2026-07-18T11:00:00+05:30",
      variants: [{ price: "140.00", available: true }],
    },
    {
      title: "Coconut Oil 1L",
      updated_at: "2026-07-18T11:30:00+05:30",
      variants: [{ price: "980.00", available: true }],
    },
    {
      title: "Wheat Flour 1kg",
      updated_at: "2026-07-15T08:00:00+05:30",
      variants: [{ price: "320.00", available: true }],
    },
    {
      title: "Rice Flour 400g",
      updated_at: "2026-07-14T08:00:00+05:30",
      variants: [{ price: "180.00", available: true }],
    },
  ],
};

assert.equal(packKgFromTitle("Keeri Samba Rice 5kg"), 5);
assert.equal(packKgFromTitle("Red Dhal 500g"), 0.5);
assert.equal(packKgFromTitle("Fresh Coconut"), 1);

assert.equal(isReasonableStaplePrice(290, "rice"), true);
assert.equal(isReasonableStaplePrice(20, "rice"), false);
assert.equal(isReasonableStaplePrice(140, "coconut"), true);

const snapshot = buildSparRetailSnapshot(FIXTURE);
assert.ok(snapshot, "expected SPAR snapshot from fixture");
assert.equal(snapshot.sourceId, "spar2u_retail");
assert.equal(snapshot.asOf.slice(0, 10), "2026-07-18");

const slugs = new Set(snapshot.stapleItems.map((item) => item.slug));
assert.ok(slugs.has("rice"));
assert.ok(slugs.has("dhal"));
assert.ok(slugs.has("big-onion"));
assert.ok(slugs.has("sugar"));
assert.ok(slugs.has("coconut"));
assert.ok(slugs.has("wheat"));

const rice = snapshot.stapleItems.find((item) => item.slug === "rice");
assert.ok(rice);
// 1450 / 5kg → 290 LKR/kg
assert.equal(rice.priceLkr, 290);

const coconut = snapshot.stapleItems.find((item) => item.slug === "coconut");
assert.ok(coconut);
assert.equal(coconut.priceLkr, 140);

const wheat = snapshot.stapleItems.find((item) => item.slug === "wheat");
assert.ok(wheat);
// Prefer "Wheat Flour 1kg" over rice flour when scanning in order.
assert.equal(wheat.priceLkr, 320);

assert.ok(snapshot.essentialsBasketLkr > 0);
assert.equal(buildSparRetailSnapshot({ products: [] }), null);
assert.equal(buildSparRetailSnapshot({}), null);

console.log("food-spar.test.ts: ok");
