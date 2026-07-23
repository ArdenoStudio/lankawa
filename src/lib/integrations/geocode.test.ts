import assert from "node:assert/strict";
import {
  mapPlaceToDistrictSlug,
  parseGeocodeResults,
  OPEN_METEO_GEOCODING_SOURCE_ID,
} from "./geocode";

assert.equal(mapPlaceToDistrictSlug("Colombo", "Homagama"), "colombo");
assert.equal(mapPlaceToDistrictSlug(undefined, "Kandy"), "kandy");
assert.equal(mapPlaceToDistrictSlug("Nuwara Eliya"), "nuwara-eliya");
assert.equal(mapPlaceToDistrictSlug(undefined, "NotADistrict"), null);

const hits = parseGeocodeResults([
  {
    name: "Homagama",
    latitude: 6.844,
    longitude: 80.003,
    admin1: "Western Province",
    admin2: "Colombo",
    country_code: "LK",
  },
  {
    name: "Somewhere",
    latitude: 1,
    longitude: 1,
    country_code: "IN",
  },
  {
    name: "Broken",
    latitude: Number.NaN,
    longitude: 80,
    country_code: "LK",
  },
]);

assert.equal(hits.length, 1);
assert.equal(hits[0].name, "Homagama");
assert.equal(hits[0].districtSlug, "colombo");
assert.equal(hits[0].countryCode, "LK");
assert.equal(hits[0].admin2, "Colombo");

assert.deepEqual(parseGeocodeResults(undefined), []);
assert.deepEqual(parseGeocodeResults([]), []);
assert.equal(OPEN_METEO_GEOCODING_SOURCE_ID, "open_meteo_geocoding");

console.log("geocode.test.ts: ok");
