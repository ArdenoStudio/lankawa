import assert from "node:assert/strict";
import { getBudgetSnapshot } from "./budget";
import { compareBudgetYears, getBudgetYoyCompare } from "./budget-yoy";

const snapshot = getBudgetSnapshot();
assert.ok(snapshot.fiscalYears.length >= 2);

const compare = getBudgetYoyCompare(snapshot);
assert.ok(compare);
assert.equal(compare.prior.id, "fy2024-25");
assert.equal(compare.current.id, "fy2025-26");

const revenue = compare.totals.find((row) => row.id === "revenue");
assert.ok(revenue);
assert.equal(revenue.prior, 4130);
assert.equal(revenue.current, 4580);
assert.ok(revenue.deltaPct != null && revenue.deltaPct > 0);

const manual = compareBudgetYears(compare.prior, compare.current);
assert.equal(manual.sectors.length, compare.sectors.length);
assert.ok(manual.ministries.length >= 1);

console.log("budget-yoy test passed");
