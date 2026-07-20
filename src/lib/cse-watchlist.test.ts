import assert from "node:assert/strict";
import {
  CSE_WATCHLIST_MAX,
  isValidCseSymbol,
  sanitizeCseWatchlist,
  toggleCseWatchlistSymbol,
} from "./cse-watchlist";

assert.equal(isValidCseSymbol("JKH.N0000"), true);
assert.equal(isValidCseSymbol("comb.n0000"), true);
assert.equal(isValidCseSymbol(""), false);
assert.equal(isValidCseSymbol("!!!"), false);

assert.deepEqual(
  sanitizeCseWatchlist(["JKH.N0000", "jkh.n0000", "COMB.N0000", "x", "HNB.N0000"]),
  ["JKH.N0000", "COMB.N0000", "HNB.N0000"],
);

const overMax = sanitizeCseWatchlist([
  "AA.N0000",
  "BB.N0000",
  "CC.N0000",
  "DD.N0000",
  "EE.N0000",
  "FF.N0000",
]);
assert.equal(overMax.length, CSE_WATCHLIST_MAX);

assert.deepEqual(toggleCseWatchlistSymbol(["JKH.N0000"], "COMB.N0000"), [
  "JKH.N0000",
  "COMB.N0000",
]);
assert.deepEqual(toggleCseWatchlistSymbol(["JKH.N0000"], "jkh.n0000"), []);

console.log("cse watchlist test passed");
