import assert from "node:assert/strict";
import {
  MARKET_FX_SOURCE_ID,
  parseMarketFxPayload,
} from "./market-fx";

const FIXTURE = { date: "2026-07-22", usd: { lkr: 336.63 } };

const snapshot = parseMarketFxPayload(
  FIXTURE,
  new Date("2026-07-22T18:00:00.000Z"),
);
assert.ok(snapshot);
assert.equal(snapshot.sourceId, MARKET_FX_SOURCE_ID);
assert.equal(snapshot.usdLkr, 336.63);
assert.equal(snapshot.asOf, "2026-07-22T12:00:00.000Z");
assert.equal(snapshot.isSeed, false);
assert.equal(snapshot.tier, "fresh");
assert.ok(snapshot.sourceName.length > 0);

assert.equal(parseMarketFxPayload({}), null);
assert.equal(parseMarketFxPayload({ date: "2026-07-22" }), null);
assert.equal(parseMarketFxPayload({ date: "bad", usd: { lkr: 300 } }), null);
assert.equal(
  parseMarketFxPayload({ date: "2026-07-22", usd: { lkr: -1 } }),
  null,
);
assert.equal(
  parseMarketFxPayload({ date: "2026-07-22", usd: { lkr: Number.NaN } }),
  null,
);

console.log("market-fx.test.ts: ok");
