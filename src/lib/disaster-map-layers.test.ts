import assert from "node:assert/strict";
import {
  DISASTER_MAP_PRESETS,
  parseDisasterMapLayers,
  parseDisasterMapPreset,
  serializeDisasterMapLayers,
} from "./disaster-map-layers";

assert.deepEqual(parseDisasterMapLayers(null), ["landslide", "flood"]);
assert.deepEqual(parseDisasterMapLayers(""), ["landslide", "flood"]);
assert.deepEqual(parseDisasterMapLayers("flood,gfm"), ["flood", "gfm"]);
assert.deepEqual(parseDisasterMapLayers("flood,bogus,firms,flood"), [
  "flood",
  "firms",
]);
assert.deepEqual(parseDisasterMapLayers("nope"), ["landslide", "flood"]);

assert.deepEqual(
  parseDisasterMapPreset("monsoon"),
  DISASTER_MAP_PRESETS.monsoon,
);
assert.deepEqual(parseDisasterMapPreset("WILDFIRE"), ["firms", "landslide"]);
assert.equal(parseDisasterMapPreset("unknown"), null);
assert.equal(parseDisasterMapPreset(undefined), null);

assert.equal(
  serializeDisasterMapLayers(["flood", "landslide", "gauges"]),
  "flood,landslide,gauges",
);
assert.deepEqual(
  parseDisasterMapLayers(
    serializeDisasterMapLayers(["gdacs", "flood", "gauges"]),
  ),
  ["gdacs", "flood", "gauges"],
);

console.log("disaster-map-layers.test.ts: ok");
