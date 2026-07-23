import assert from "node:assert/strict";
import {
  formatApproxPlace,
  NOMINATIM_OSM_SOURCE_ID,
  parseNominatimReverse,
} from "./nominatim";

assert.equal(formatApproxPlace(6.9271, 79.8612), "6.93, 79.86");
assert.equal(formatApproxPlace(Number.NaN, 79), "—, —");

const parsed = parseNominatimReverse(
  {
    display_name: "Fort, Colombo, Western Province, Sri Lanka",
    lat: "6.93",
    lon: "79.85",
  },
  6.93,
  79.85,
);
assert.ok(parsed);
assert.equal(parsed.displayName, "Fort, Colombo, Western Province, Sri Lanka");
assert.equal(parsed.lat, 6.93);
assert.equal(parsed.lon, 79.85);

assert.equal(parseNominatimReverse({ error: "Unable to geocode" }, 1, 2), null);
assert.equal(parseNominatimReverse({ display_name: "  " }, 1, 2), null);
assert.equal(parseNominatimReverse(undefined, 1, 2), null);
assert.equal(NOMINATIM_OSM_SOURCE_ID, "nominatim_osm");

console.log("nominatim.test.ts: ok");
