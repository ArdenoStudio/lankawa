import assert from "node:assert/strict";
import {
  areaUnderPolyline,
  indexAsDate,
  niceValuePad,
  parseChartDay,
  projectSeries,
  sharedTimeDomain,
  toStepAfterPath,
  toPolylinePoints,
} from "./mono";

assert.equal(parseChartDay("2026-03-15T12:00:00Z"), Date.parse("2026-03-15"));
assert.deepEqual(niceValuePad(10, 10), [9.2, 10.8]);
assert.deepEqual(niceValuePad(0, 100, 0.1), [-10, 110]);

const domain = sharedTimeDomain([
  [
    { date: "2026-01-01", value: 1 },
    { date: "2026-01-10", value: 2 },
  ],
  [{ date: "2026-01-05", value: 3 }],
]);
assert.equal(domain[0], Date.parse("2026-01-01"));
assert.equal(domain[1], Date.parse("2026-01-10"));

const plotted = projectSeries(
  [
    { date: "2026-01-01", value: 0 },
    { date: "2026-01-02", value: 100 },
  ],
  (t) => t,
  (v) => v,
);
assert.equal(toPolylinePoints(plotted), `${plotted[0].x},${plotted[0].y} ${plotted[1].x},${plotted[1].y}`);

const step = toStepAfterPath([
  { x: 0, y: 10 },
  { x: 20, y: 5 },
  { x: 40, y: 8 },
]);
assert.equal(step, "M 0 10 H 20 V 5 H 40 V 8");

const area = areaUnderPolyline(
  [
    { x: 0, y: 2 },
    { x: 10, y: 4 },
  ],
  20,
);
assert.equal(area, "M 0 2 L 10 4 L 10 20 L 0 20 Z");
assert.equal(indexAsDate(0), "2000-01-01");
assert.equal(indexAsDate(13), "2001-02-01");

console.log("mono chart helpers: ok");
