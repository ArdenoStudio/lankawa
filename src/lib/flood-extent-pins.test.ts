import assert from "node:assert/strict";
import {
  floodExtentPinsAsGeoJson,
  getFloodExtentPinsSnapshot,
  parseFloodExtentPins,
} from "./flood-extent-pins";

const parsed = parseFloodExtentPins([
  {
    type: "Feature",
    properties: {
      id: "a",
      label: "Test",
      districtSlug: "colombo",
      severity: "watch",
    },
    geometry: { type: "Point", coordinates: [79.9, 6.9] },
  },
  {
    type: "Feature",
    properties: {
      id: "bad",
      label: "Bad",
      districtSlug: "colombo",
      severity: "unknown",
    },
    geometry: { type: "Point", coordinates: [79.9, 6.9] },
  },
]);

assert.equal(parsed.length, 1);
assert.equal(parsed[0]?.id, "a");
assert.equal(parsed[0]?.longitude, 79.9);

const snapshot = getFloodExtentPinsSnapshot();
assert.equal(snapshot.isSeed, true);
assert.ok(snapshot.pins.length >= 4);
assert.ok(snapshot.pins.every((pin) => Number.isFinite(pin.latitude)));

const geo = floodExtentPinsAsGeoJson(snapshot.pins);
assert.equal(geo.type, "FeatureCollection");
assert.equal(geo.features.length, snapshot.pins.length);

console.log("flood-extent-pins.test.ts: ok");
