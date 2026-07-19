import assert from "node:assert/strict";
import {
  evaluateAlertPins,
  floodIsElevated,
  powerNeedsAttention,
} from "./alert-pins";

assert.equal(powerNeedsAttention("Normal"), false);
assert.equal(powerNeedsAttention("Outage"), true);
assert.equal(powerNeedsAttention("Scheduled interruption"), true);

const flood = floodIsElevated([
  { alertLevel: "NORMAL", count: 3 },
  { alertLevel: "ALERT", count: 2 },
]);
assert.equal(flood.elevated, true);
assert.ok(flood.detail?.includes("ALERT"));

const quiet = floodIsElevated([{ alertLevel: "NORMAL", count: 4 }]);
assert.equal(quiet.elevated, false);

const fired = evaluateAlertPins(["fx_move", "flood", "power", "met"], {
  fxAbsDeltaLkr: 1.2,
  fxThresholdLkr: 1,
  floodElevated: true,
  floodDetail: "ALERT: 2",
  powerAttention: false,
  powerDetail: null,
  metWarning: true,
  metDetail: "Amber advisory",
});

assert.deepEqual(
  fired.map((item) => item.id),
  ["fx_move", "flood", "met"],
);

const quietPins = evaluateAlertPins(["fx_move"], {
  fxAbsDeltaLkr: 0.2,
  fxThresholdLkr: 1,
  floodElevated: false,
  floodDetail: null,
  powerAttention: false,
  powerDetail: null,
  metWarning: false,
  metDetail: null,
});
assert.equal(quietPins.length, 0);

console.log("alert pins test passed");
