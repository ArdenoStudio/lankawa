import assert from "node:assert/strict";
import {
  ALERT_PIN_IDS,
  evaluateAlertPins,
  floodIsElevated,
  isAlertPinId,
  powerNeedsAttention,
  type AlertSignalContext,
} from "./alert-pins";
import { isInFuelRevisionWindow } from "./fuel-revision-window";

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

assert.equal(isAlertPinId("fx_move"), true);
assert.equal(isAlertPinId("fuel_revision"), true);
assert.equal(isAlertPinId("news_cluster"), true);
assert.equal(isAlertPinId("tender_closing"), true);
assert.equal(isAlertPinId("not_a_pin"), false);
assert.ok(ALERT_PIN_IDS.includes("met_flood"));
assert.ok(ALERT_PIN_IDS.includes("dengue_spike"));
assert.ok(ALERT_PIN_IDS.includes("cse_move"));
assert.ok(ALERT_PIN_IDS.includes("col_basket"));
assert.ok(ALERT_PIN_IDS.includes("tender_closing"));

const now = new Date("2026-07-10T12:00:00Z");
assert.equal(
  isInFuelRevisionWindow(
    [{ recordedAt: "2026-07-05" }, { recordedAt: "2026-06-01" }],
    now,
  ),
  true,
);
assert.equal(
  isInFuelRevisionWindow([{ recordedAt: "2026-06-20" }], now),
  false,
);
assert.equal(isInFuelRevisionWindow([], now), false);
assert.equal(
  isInFuelRevisionWindow([{ recordedAt: "2026-07-10" }], now),
  true,
);
assert.equal(
  isInFuelRevisionWindow([{ recordedAt: "2026-06-30" }], now),
  true,
);
assert.equal(
  isInFuelRevisionWindow([{ recordedAt: "2026-06-29" }], now),
  false,
);

const baseContext: AlertSignalContext = {
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
  fuelRevisionAttention: true,
  fuelRevisionDetail: "Petrol 92 revised 2026-07-05 (−10 LKR)",
  metFloodAttention: true,
  metFloodDetail: "Amber advisory · Kelani rising 6.2 cm/h",
  dengueSpikeAttention: true,
  dengueSpikeDetail: "colombo +24% WoW",
  cseMoveAttention: true,
  cseMoveDetail: "ASPI +1.42%",
  colBasketAttention: true,
  colBasketDetail: "Petrol 92 −8 LKR/L",
  newsClusterAttention: true,
  newsClusterDetail: "fuel price · 3 outlets",
  tenderClosingAttention: true,
  tenderClosingDetail: "2 tenders close within 7d · soonest 2026-07-22",
};

const fired = evaluateAlertPins([...ALERT_PIN_IDS], baseContext);

assert.deepEqual(
  fired.map((item) => item.id),
  [
    "fx_move",
    "flood",
    "flood_rising",
    "met",
    "landslide",
    "fire",
    "gdacs",
    "fuel_revision",
    "met_flood",
    "dengue_spike",
    "cse_move",
    "col_basket",
    "news_cluster",
    "tender_closing",
  ],
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

const newPinsQuiet = evaluateAlertPins(
  [
    "fuel_revision",
    "met_flood",
    "dengue_spike",
    "cse_move",
    "col_basket",
    "news_cluster",
    "tender_closing",
  ],
  {
    ...baseContext,
    fuelRevisionAttention: false,
    metFloodAttention: false,
    dengueSpikeAttention: false,
    cseMoveAttention: false,
    colBasketAttention: false,
    newsClusterAttention: false,
    tenderClosingAttention: false,
  },
);
assert.equal(newPinsQuiet.length, 0);

const fuelOnly = evaluateAlertPins(["fuel_revision"], baseContext);
assert.equal(fuelOnly.length, 1);
assert.ok(fuelOnly[0].detail.includes("Petrol 92"));

const metFloodOnly = evaluateAlertPins(["met_flood"], {
  ...baseContext,
  metFloodAttention: true,
  metFloodDetail: null,
});
assert.equal(metFloodOnly.length, 1);
assert.match(metFloodOnly[0].detail, /Met warning/i);

const dengueOnly = evaluateAlertPins(["dengue_spike"], baseContext);
assert.equal(dengueOnly.length, 1);

const cseOnly = evaluateAlertPins(["cse_move"], {
  ...baseContext,
  cseMoveAttention: true,
  cseMoveDetail: null,
});
assert.equal(cseOnly.length, 1);
assert.match(cseOnly[0].detail, /ASPI/);

const colOnly = evaluateAlertPins(["col_basket"], baseContext);
assert.equal(colOnly.length, 1);

const newsOnly = evaluateAlertPins(["news_cluster"], {
  ...baseContext,
  newsClusterAttention: true,
  newsClusterDetail: null,
});
assert.equal(newsOnly.length, 1);
assert.match(newsOnly[0].detail, /cluster/i);

const tenderOnly = evaluateAlertPins(["tender_closing"], {
  ...baseContext,
  tenderClosingAttention: true,
  tenderClosingDetail: null,
});
assert.equal(tenderOnly.length, 1);
assert.match(tenderOnly[0].detail, /tender/i);

const subset = evaluateAlertPins(["power", "cse_move", "news_cluster"], {
  ...baseContext,
  powerAttention: true,
  powerDetail: "Outage — Western",
  cseMoveAttention: false,
  newsClusterAttention: true,
});
assert.deepEqual(
  subset.map((item) => item.id),
  ["power", "news_cluster"],
);

console.log("alert pins test passed");
