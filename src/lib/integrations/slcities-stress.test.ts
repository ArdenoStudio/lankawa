import assert from "node:assert/strict";
import { DISTRICTS, getDistrict } from "../districts.ts";
import { getSource, getSourceProvenancePath, SOURCES } from "../sources.ts";
import {
  getCitySearch,
  lookupPostcode,
  getNearbyCities,
  getDistrictCities,
  SEED_FALLBACK_DISCLAIMER,
  SLCITIES_API_SOURCE_ID,
  SLCITIES_SEED_SOURCE_ID,
} from "./slcities.ts";

async function runStressTest() {
  console.log("=== Starting Empirical Stress Test Suite for M1 Location & District Hierarchy ===\n");

  // =========================================================================
  // TASK 1: Static Parameter Generation Verification
  // =========================================================================
  console.log("--- Task 1: Static Parameter Generation Verification ---");

  // 1.1 District Static Params Verification
  const districtSlugs = DISTRICTS.map((d) => ({ slug: d.slug }));
  assert.equal(districtSlugs.length, 25, "Expected exactly 25 districts for static param generation");

  const expectedSlugs = [
    "colombo", "gampaha", "kalutara", "kandy", "matale", "nuwara-eliya",
    "galle", "matara", "hambantota", "jaffna", "kilinochchi", "mannar",
    "vavuniya", "mullaitivu", "batticaloa", "ampara", "trincomalee",
    "kurunegala", "puttalam", "anuradhapura", "polonnaruwa", "badulla",
    "monaragala", "ratnapura", "kegalle"
  ];

  for (const expected of expectedSlugs) {
    const found = districtSlugs.find((item) => item.slug === expected);
    assert.ok(found, `Static param missing for district slug: '${expected}'`);
    const distObj = getDistrict(expected);
    assert.ok(distObj, `District object missing for slug: '${expected}'`);
    assert.equal(distObj.slug, expected);
  }
  console.log("  [PASS] 25/25 district static params verified.");

  // 1.2 Sources Static Params Verification (`slcities_api` and `slcities_seed`)
  const sourcesStaticParams = SOURCES.map((s) => ({ id: s.id }));
  const hasApiSource = sourcesStaticParams.some((item) => item.id === SLCITIES_API_SOURCE_ID);
  const hasSeedSource = sourcesStaticParams.some((item) => item.id === SLCITIES_SEED_SOURCE_ID);

  assert.ok(hasApiSource, `SOURCES array must include '${SLCITIES_API_SOURCE_ID}' for /sources/[id] static params`);
  assert.ok(hasSeedSource, `SOURCES array must include '${SLCITIES_SEED_SOURCE_ID}' for /sources/[id] static params`);

  const apiSourceDef = getSource(SLCITIES_API_SOURCE_ID);
  assert.ok(apiSourceDef, `getSource('${SLCITIES_API_SOURCE_ID}') returned undefined`);
  assert.equal(apiSourceDef.category, "civic");

  const seedSourceDef = getSource(SLCITIES_SEED_SOURCE_ID);
  assert.ok(seedSourceDef, `getSource('${SLCITIES_SEED_SOURCE_ID}') returned undefined`);
  assert.equal(seedSourceDef.category, "civic");

  assert.equal(getSourceProvenancePath(SLCITIES_API_SOURCE_ID), "/sources/slcities_api");
  assert.equal(getSourceProvenancePath(SLCITIES_SEED_SOURCE_ID), "/sources/slcities_seed");
  console.log("  [PASS] Source static params & provenance paths verified for slcities_api & slcities_seed.\n");

  // =========================================================================
  // TASK 2: Seed Fallback Disclaimer & Live API Failure Handling
  // =========================================================================
  console.log("--- Task 2: Seed Fallback Disclaimer & Live API Failure Verification ---");

  // Verifying constant text
  assert.equal(SEED_FALLBACK_DISCLAIMER, "Seed fallback — live API unavailable");

  // Test adapter fallback when live endpoints are unreachable or simulated down
  const searchFallback = await getCitySearch("Colombo");
  assert.ok(searchFallback.hits.length > 0, "Fallback search should return Colombo seed results");
  assert.equal(searchFallback.isFallback, true, "isFallback should be true when live API is unreachable");
  assert.equal(searchFallback.disclaimer, "Seed fallback — live API unavailable", "Disclaimer string must match requirement verbatim");
  assert.equal(searchFallback.sourceId, SLCITIES_SEED_SOURCE_ID, "sourceId must be slcities_seed in fallback mode");

  const postcodeFallback = await lookupPostcode("00100");
  assert.ok(postcodeFallback.city !== null, "Fallback postcode lookup should resolve 00100");
  assert.equal(postcodeFallback.isFallback, true);
  assert.equal(postcodeFallback.disclaimer, "Seed fallback — live API unavailable");
  assert.equal(postcodeFallback.sourceId, SLCITIES_SEED_SOURCE_ID);

  const nearbyFallback = await getNearbyCities(6.9271, 79.8612, 10);
  assert.ok(nearbyFallback.cities.length > 0);
  assert.equal(nearbyFallback.isFallback, true);
  assert.equal(nearbyFallback.disclaimer, "Seed fallback — live API unavailable");
  assert.equal(nearbyFallback.sourceId, SLCITIES_SEED_SOURCE_ID);

  const districtCitiesFallback = await getDistrictCities("kandy");
  assert.ok(districtCitiesFallback.cities.length > 0);
  assert.equal(districtCitiesFallback.isFallback, true);
  assert.equal(districtCitiesFallback.disclaimer, "Seed fallback — live API unavailable");
  assert.equal(districtCitiesFallback.sourceId, SLCITIES_SEED_SOURCE_ID);

  console.log("  [PASS] Seed fallback disclaimer ('Seed fallback — live API unavailable') and sourceId verified across all endpoints.\n");

  // =========================================================================
  // TASK 3: Edge Case District Slugs & Query Parameter Combinations
  // =========================================================================
  console.log("--- Task 3: Edge Case District Slugs & Query Parameter Testing ---");

  // 3.1 District Slugs Edge Cases
  console.log("  3.1 Testing District Slug Edge Cases...");
  
  // Test case insensitivity & spaces for getDistrictCities
  const kandyMixed = await getDistrictCities("  KaNdY ");
  assert.equal(kandyMixed.districtSlug, "kandy");
  assert.equal(kandyMixed.districtName, "Kandy");
  assert.ok(kandyMixed.cities.length > 0);

  const colomboUpper = await getDistrictCities("COLOMBO");
  assert.equal(colomboUpper.districtSlug, "colombo");
  assert.ok(colomboUpper.cities.length > 0);

  // Test invalid/non-existent district slugs
  const invalidSlugs = ["atlantis", "invalid-district-999", "12345", "<script>alert(1)</script>", "../../etc/passwd"];
  for (const inv of invalidSlugs) {
    const res = await getDistrictCities(inv);
    assert.equal(res.districtSlug, inv.toLowerCase().trim());
    assert.equal(res.cities.length, 0, `Invalid slug '${inv}' should yield 0 cities`);
    assert.equal(res.isFallback, true);
    assert.equal(res.disclaimer, SEED_FALLBACK_DISCLAIMER);
    const distLookup = getDistrict(inv);
    assert.equal(distLookup, undefined, `getDistrict('${inv}') must return undefined`);
  }
  console.log("    [PASS] District slug edge cases (case, space, invalid, injection) handled cleanly.");

  // 3.2 Postal Code Lookup Edge Cases
  console.log("  3.2 Testing Postal Code Lookup Edge Cases...");

  // Standard 5-digit postal codes
  const validPostcodes = [
    { code: "00100", expectedCity: "Colombo Fort", expectedDistrict: "colombo" },
    { code: "20000", expectedCity: "Kandy", expectedDistrict: "kandy" },
    { code: "80000", expectedCity: "Galle", expectedDistrict: "galle" },
    { code: "11500", expectedCity: "Negombo", expectedDistrict: "gampaha" },
  ];

  for (const testItem of validPostcodes) {
    const res = await lookupPostcode(testItem.code);
    assert.ok(res.city !== null, `Postcode ${testItem.code} should return city`);
    assert.equal(res.city?.districtSlug, testItem.expectedDistrict);
  }

  // Postal code sanitization and formatting tests
  const paddedRes = await lookupPostcode("100"); // padded to 00100
  assert.ok(paddedRes.city !== null);
  assert.equal(paddedRes.city?.postcode, "00100");

  const whitespacePostcode = await lookupPostcode(" 20000 ");
  assert.ok(whitespacePostcode.city !== null);
  assert.equal(whitespacePostcode.city?.districtSlug, "kandy");

  // Non-existent or bad postcodes
  const nonExistentPostcodes = ["99999", "00000", "abc", "!-@#$", "9999999"];
  for (const badCode of nonExistentPostcodes) {
    const res = await lookupPostcode(badCode);
    assert.equal(res.city, null, `Invalid postcode '${badCode}' should return city: null`);
    assert.equal(res.isFallback, true);
  }
  console.log("    [PASS] Postal code sanitization, formatting, and invalid postcodes handled cleanly.");

  // 3.3 City Search Query Edge Cases
  console.log("  3.3 Testing City Search Query Edge Cases...");

  // Partial matches
  const partialCol = await getCitySearch("col");
  assert.ok(partialCol.hits.length > 0, "Partial search 'col' should return hits");

  // Alt names matching
  const altNameFort = await getCitySearch("Fort");
  assert.ok(altNameFort.hits.some((h) => h.name === "Colombo Fort"), "Alt name search 'Fort' should match Colombo Fort");

  const altNameColpetty = await getCitySearch("Colpetty");
  assert.ok(altNameColpetty.hits.some((h) => h.name === "Kollupitiya"), "Alt name search 'Colpetty' should match Kollupitiya");

  const altNameMigamuwa = await getCitySearch("MIGAMUWA");
  assert.ok(altNameMigamuwa.hits.some((h) => h.name === "Negombo"), "Alt name search 'MIGAMUWA' should match Negombo");

  // Special characters & injection attempts
  const injectionQueries = ["' OR '1'='1", "<script>alert(1)</script>", "%20%27", "SELECT * FROM cities"];
  for (const injQuery of injectionQueries) {
    const res = await getCitySearch(injQuery);
    assert.equal(res.hits.length, 0, `Injection query '${injQuery}' should return 0 hits without crashing`);
    assert.equal(res.isFallback, true);
  }
  console.log("    [PASS] City search query edge cases (partial, altNames, injection) handled cleanly.");

  // 3.4 Nearby Cities Radius & Coordinate Edge Cases
  console.log("  3.4 Testing Nearby Cities Radius & Coordinate Edge Cases...");

  // Nearby Colombo (6.9271, 79.8612) with 5km vs 50km
  const nearby5km = await getNearbyCities(6.9271, 79.8612, 5);
  const nearby50km = await getNearbyCities(6.9271, 79.8612, 50);
  assert.ok(nearby50km.cities.length >= nearby5km.cities.length);

  // Distant location outside Sri Lanka (London: 51.5074, -0.1278) within 50km
  const londonNearby = await getNearbyCities(51.5074, -0.1278, 50);
  assert.equal(londonNearby.cities.length, 0, "Location in London should return 0 nearby Sri Lankan cities");

  // Extreme radius 0km
  const zeroRadius = await getNearbyCities(6.9271, 79.8612, 0);
  // Distance to exact lat/lng might be > 0 due to city coords, so zeroRadius can be 0 or small
  assert.ok(zeroRadius.cities.length <= nearby5km.cities.length);

  console.log("    [PASS] Nearby cities coordinate and radius edge cases handled cleanly.");

  console.log("\n=== ALL STRESS TESTS PASSED SUCCESSFULLY! ===");
}

runStressTest().catch((err) => {
  console.error("Stress Test Failure:", err);
  process.exit(1);
});
