import assert from "node:assert/strict";
import {
  COINGECKO_BTC_LKR_SOURCE_ID,
  parseCoinGeckoBtcLkr,
} from "./coingecko";

const FIXTURE = { bitcoin: { lkr: 45_000_000 } };
const asOf = "2026-07-22T12:00:00.000Z";

const snapshot = parseCoinGeckoBtcLkr(FIXTURE, asOf);
assert.ok(snapshot);
assert.equal(snapshot.sourceId, COINGECKO_BTC_LKR_SOURCE_ID);
assert.equal(snapshot.btcLkr, 45_000_000);
assert.equal(snapshot.asOf, asOf);
assert.equal(snapshot.isSeed, false);
assert.ok(snapshot.sourceName.length > 0);

assert.equal(parseCoinGeckoBtcLkr({}), null);
assert.equal(parseCoinGeckoBtcLkr({ bitcoin: {} }), null);
assert.equal(parseCoinGeckoBtcLkr({ bitcoin: { lkr: -1 } }), null);

console.log("coingecko.test.ts: ok");
