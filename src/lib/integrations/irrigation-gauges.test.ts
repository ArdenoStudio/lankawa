import assert from "node:assert/strict";
import {
  collapseLatestGauges,
  parseArcGisEditDate,
  resolveGaugeAlertStatus,
  toFloodStationLevel,
} from "./irrigation-gauges";

assert.equal(parseArcGisEditDate(null), null);
assert.equal(parseArcGisEditDate(undefined), null);
assert.equal(
  parseArcGisEditDate(1_784_525_607_085),
  new Date(1_784_525_607_085).toISOString(),
);

assert.equal(
  resolveGaugeAlertStatus({
    waterLevel: 2,
    alertThreshold: 5,
    minorThreshold: 7,
    majorThreshold: 9,
  }),
  "NORMAL",
);
assert.equal(
  resolveGaugeAlertStatus({
    waterLevel: 5,
    alertThreshold: 5,
    minorThreshold: 7,
    majorThreshold: 9,
  }),
  "ALERT",
);
assert.equal(
  resolveGaugeAlertStatus({
    waterLevel: 7.5,
    alertThreshold: 5,
    minorThreshold: 7,
    majorThreshold: 9,
  }),
  "WARNING",
);
assert.equal(
  resolveGaugeAlertStatus({
    waterLevel: 9,
    alertThreshold: 5,
    minorThreshold: 7,
    majorThreshold: 9,
  }),
  "DANGER",
);
assert.equal(
  resolveGaugeAlertStatus({
    waterLevel: null,
    alertThreshold: 5,
    minorThreshold: 7,
    majorThreshold: 9,
  }),
  "UNKNOWN",
);

const collapsed = collapseLatestGauges([
  {
    attributes: {
      gauge: "Glencourse",
      basin: "Kelani Ganga",
      water_level: 9.1,
      rain_fall: 2,
      alertpull: 15,
      minorpull: 16.5,
      majorpull: 19,
      EditDate: 1_784_525_607_085,
    },
    geometry: { x: 80.19, y: 6.97 },
  },
  {
    attributes: {
      gauge: "Glencourse",
      basin: "Kelani Ganga",
      water_level: 8.0,
      rain_fall: 0,
      alertpull: 15,
      minorpull: 16.5,
      majorpull: 19,
      EditDate: 1_784_520_000_000,
    },
  },
  {
    attributes: {
      gauge: "Peradeniya",
      basin: "Mahaweli Ganga",
      water_level: 7.2,
      rain_fall: 0,
      alertpull: 5,
      minorpull: 7,
      majorpull: 9,
      EditDate: 1_784_525_500_000,
    },
  },
]);

assert.equal(collapsed.length, 2);
assert.equal(collapsed[0]?.gauge, "Peradeniya");
assert.equal(collapsed[0]?.alertStatus, "WARNING");
assert.equal(collapsed[1]?.gauge, "Glencourse");
assert.equal(collapsed[1]?.waterLevel, 9.1);
assert.equal(collapsed[1]?.alertStatus, "NORMAL");

const mapped = toFloodStationLevel(collapsed[0]!);
assert.equal(mapped.stationName, "Peradeniya");
assert.equal(mapped.riverName, "Mahaweli Ganga");
assert.equal(mapped.alertStatus, "WARNING");
assert.equal(mapped.waterLevel, 7.2);

console.log("irrigation-gauges.test.ts: ok");
