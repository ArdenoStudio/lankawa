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

const baseContext = {
  fxAbsDeltaLkr: 1.2,
  fxThresholdLkr: 1,
  fxUnusual: false,
  fxAnomalyDetail: null,
  floodElevated: true,
  floodDetail: "ALERT: 2",
  floodRising: true,
  floodRisingDetail: "Kelani rising 6.2 cm/h",
  powerAttention: false,
  powerDetail: null,
  metWarning: true,
  metDetail: "Amber advisory",
  landslideAttention: true,
  landslideDetail: "3 watch",
  fireAttention: true,
  fireDetail: "4 fire pins",
  gdacsAttention: true,
  gdacsDetail: "Orange TC nearby",
};

const fired = evaluateAlertPins(
  [
    "fx_move",
    "flood",
    "flood_rising",
    "power",
    "met",
    "landslide",
    "fire",
    "gdacs",
  ],
  baseContext,
);

assert.deepEqual(
  fired.map((item) => item.id),
  ["fx_move", "flood", "flood_rising", "met", "landslide", "fire", "gdacs"],
);

const unusualOnly = evaluateAlertPins(["fx_move"], {
  ...baseContext,
  fxAbsDeltaLkr: 0.2,
  fxUnusual: true,
  fxAnomalyDetail: "USD/LKR Δ +0.20 LKR · z≈2.8",
});
assert.equal(unusualOnly.length, 1);

const quietPins = evaluateAlertPins(["fx_move", "flood_rising", "fire"], {
  ...baseContext,
  fxAbsDeltaLkr: 0.2,
  fxUnusual: false,
  floodRising: false,
  fireAttention: false,
});
assert.equal(quietPins.length, 0);

console.log("alert pins test passed");
