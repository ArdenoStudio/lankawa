import assert from "node:assert/strict";
import {
  getCitySearch,
  lookupPostcode,
  getNearbyCities,
  getDistrictCities,
  haversineDistanceKm,
  SEED_FALLBACK_DISCLAIMER,
  SLCITIES_API_SOURCE_ID,
  SLCITIES_SEED_SOURCE_ID,
} from "./slcities.ts";

async function runTests() {
  // Test 1: Verify constants
  assert.equal(SEED_FALLBACK_DISCLAIMER, "Seed fallback — live API unavailable");
  assert.equal(SLCITIES_API_SOURCE_ID, "slcities_api");
  assert.equal(SLCITIES_SEED_SOURCE_ID, "slcities_seed");

  // Test 2: Haversine distance calculation between Colombo (6.9271, 79.8612) and Dehiwala (6.8511, 79.8656)
  const dist = haversineDistanceKm(6.9271, 79.8612, 6.8511, 79.8656);
  assert.ok(dist > 5 && dist < 12, `Expected distance ~8.5km, got ${dist}`);

  // Test 3: getCitySearch for "Colombo"
  const colomboSearch = await getCitySearch("Colombo");
  assert.ok(colomboSearch.total > 0, "Expected search hits for 'Colombo'");
  assert.ok(Array.isArray(colomboSearch.hits));
  assert.ok(colomboSearch.hits.some((h) => h.name.includes("Colombo") || h.districtSlug === "colombo"));
  assert.ok(colomboSearch.sourceId === SLCITIES_API_SOURCE_ID || colomboSearch.sourceId === SLCITIES_SEED_SOURCE_ID);

  // Test 4: lookupPostcode for "00100" (Colombo Fort)
  const postcodeRes = await lookupPostcode("00100");
  assert.ok(postcodeRes.city !== null, "Expected city for postcode 00100");
  assert.equal(postcodeRes.city?.postcode, "00100");
  assert.equal(postcodeRes.city?.districtSlug, "colombo");

  // Test 5: lookupPostcode for "20000" (Kandy)
  const kandyPostcode = await lookupPostcode("20000");
  assert.ok(kandyPostcode.city !== null, "Expected city for postcode 20000");
  assert.equal(kandyPostcode.city?.districtSlug, "kandy");

  // Test 6: getNearbyCities around Colombo coordinates (6.9271, 79.8612) within 15km
  const nearbyRes = await getNearbyCities(6.9271, 79.8612, 15);
  assert.ok(nearbyRes.cities.length > 0, "Expected nearby cities around Colombo");
  assert.ok(nearbyRes.cities[0].distanceKm !== undefined);
  // Verify sorted by distanceKm ascending
  for (let i = 1; i < nearbyRes.cities.length; i++) {
    assert.ok(
      (nearbyRes.cities[i].distanceKm ?? 0) >= (nearbyRes.cities[i - 1].distanceKm ?? 0),
      "Cities should be sorted by distance ascending",
    );
  }

  // Test 7: getDistrictCities for "galle"
  const galleRes = await getDistrictCities("galle");
  assert.equal(galleRes.districtSlug, "galle");
  assert.ok(galleRes.cities.length > 0, "Expected cities for Galle district");
  assert.ok(galleRes.cities.every((c) => c.districtSlug === "galle"));

  // Test 8: Verify fallback handling and structure when live API is unreached
  if (colomboSearch.isFallback) {
    assert.equal(colomboSearch.disclaimer, "Seed fallback — live API unavailable");
    assert.equal(colomboSearch.sourceId, SLCITIES_SEED_SOURCE_ID);
  }

  console.log("slcities.test.ts: ok");
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
