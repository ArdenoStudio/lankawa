import assert from "node:assert/strict";
import {
  getCitySearch,
  lookupPostcode,
  getNearbyCities,
  getDistrictCities,
  SEED_FALLBACK_DISCLAIMER,
  SLCITIES_SEED_SOURCE_ID,
} from "../../src/lib/integrations/slcities.ts";

const originalFetch = globalThis.fetch;

interface TestResult {
  name: string;
  category: string;
  status: "PASS" | "FAIL";
  details?: string;
}

const results: TestResult[] = [];

function recordResult(name: string, category: string, status: "PASS" | "FAIL", details?: string) {
  results.push({ name, category, status, details });
  const icon = status === "PASS" ? "✅" : "❌";
  console.log(`${icon} [${category}] ${name}${details ? ` - ${details}` : ""}`);
}

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

interface MetaResult {
  isFallback: boolean;
  disclaimer: string | null;
  sourceId: string;
}

async function runAdversarialSuite() {
  console.log("=== STARTING ADVERSARIAL TEST SUITE FOR slcities.ts ===\n");

  // -------------------------------------------------------------
  // CATEGORY 1: Timeout & Abort Signal Behavior (>10s)
  // -------------------------------------------------------------
  console.log("--- Category 1: Timeout & Abort Signal Tests ---");

  // Test 1.1: Simulated Timeout (>10s delay in fetch)
  try {
    globalThis.fetch = (async (
      _url: RequestInfo | URL,
      init?: RequestInit,
    ) => {
      // Simulate slow connection exceeding 10s timeout signal
      return new Promise((_, reject) => {
        const signal = init?.signal;
        if (signal) {
          if (signal.aborted) {
            return reject(new DOMException("The operation was aborted due to timeout", "TimeoutError"));
          }
          signal.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted due to timeout", "TimeoutError"));
          });
        }
        // If no abort signal fires, reject after 11s
        setTimeout(() => {
          reject(new DOMException("The operation was aborted due to timeout", "TimeoutError"));
        }, 11000);
      });
    }) as unknown as typeof fetch;

    const start = Date.now();
    const res = await getCitySearch("Colombo");
    const elapsed = Date.now() - start;

    assert.equal(res.isFallback, true);
    assert.equal(res.disclaimer, SEED_FALLBACK_DISCLAIMER);
    assert.equal(res.sourceId, SLCITIES_SEED_SOURCE_ID);
    assert.ok(res.hits.length > 0);

    recordResult(
      "Simulated Timeout (>10s) Fallback",
      "Timeout & Abort",
      "PASS",
      `Handled timeout gracefully in ${elapsed}ms, fallback returned ${res.hits.length} cities`,
    );
  } catch (err) {
    recordResult("Simulated Timeout (>10s) Fallback", "Timeout & Abort", "FAIL", errMessage(err));
  } finally {
    globalThis.fetch = originalFetch;
  }

  // Test 1.2: Immediate Abort Signal / Network Error
  try {
    globalThis.fetch = (async () => {
      throw new Error("Network error / fetch failed");
    }) as unknown as typeof fetch;

    const resSearch = await getCitySearch("Kandy");
    const resPostcode = await lookupPostcode("20000");
    const resNearby = await getNearbyCities(6.9, 79.8, 10);
    const resDistrict = await getDistrictCities("kandy");

    assert.equal(resSearch.isFallback, true);
    assert.equal(resSearch.disclaimer, SEED_FALLBACK_DISCLAIMER);
    assert.equal(resSearch.sourceId, SLCITIES_SEED_SOURCE_ID);

    assert.equal(resPostcode.isFallback, true);
    assert.equal(resPostcode.disclaimer, SEED_FALLBACK_DISCLAIMER);
    assert.equal(resPostcode.sourceId, SLCITIES_SEED_SOURCE_ID);

    assert.equal(resNearby.isFallback, true);
    assert.equal(resNearby.disclaimer, SEED_FALLBACK_DISCLAIMER);
    assert.equal(resNearby.sourceId, SLCITIES_SEED_SOURCE_ID);

    assert.equal(resDistrict.isFallback, true);
    assert.equal(resDistrict.disclaimer, SEED_FALLBACK_DISCLAIMER);
    assert.equal(resDistrict.sourceId, SLCITIES_SEED_SOURCE_ID);

    recordResult("Network Error Graceful Fallback", "Timeout & Abort", "PASS", "All 4 functions fell back cleanly on fetch failure");
  } catch (err) {
    recordResult("Network Error Graceful Fallback", "Timeout & Abort", "FAIL", errMessage(err));
  } finally {
    globalThis.fetch = originalFetch;
  }

  // -------------------------------------------------------------
  // CATEGORY 2: Invalid / Edge-Case Inputs
  // -------------------------------------------------------------
  console.log("\n--- Category 2: Invalid & Edge-Case Input Tests ---");

  // Force fetch to fail so we test adapter handling deterministically
  globalThis.fetch = (async () => {
    throw new Error("API Offline for deterministic edge-case testing");
  }) as unknown as typeof fetch;

  // Test 2.1: Empty query
  try {
    const res = await getCitySearch("");
    assert.equal(res.isFallback, true);
    assert.equal(res.disclaimer, SEED_FALLBACK_DISCLAIMER);
    assert.equal(res.sourceId, SLCITIES_SEED_SOURCE_ID);
    assert.ok(res.hits.length > 0, "Empty query returns all seed cities");
    recordResult("Empty Query Search", "Edge Inputs", "PASS", `Returned ${res.total} seed cities`);
  } catch (err) {
    recordResult("Empty Query Search", "Edge Inputs", "FAIL", errMessage(err));
  }

  // Test 2.2: Whitespace query
  try {
    const res = await getCitySearch("   \t\n  ");
    assert.equal(res.isFallback, true);
    assert.ok(res.hits.length > 0);
    recordResult("Whitespace Query Search", "Edge Inputs", "PASS", `Trimmed whitespace, returned ${res.total} seed cities`);
  } catch (err) {
    recordResult("Whitespace Query Search", "Edge Inputs", "FAIL", errMessage(err));
  }

  // Test 2.3: Special Characters & Injection Strings
  try {
    const specialQueries = [
      "!@#$%^&*()_+",
      "<script>alert(1)</script>",
      "' OR 1=1 --",
      "\\0",
      "../../etc/passwd",
      "Colombo 🇱🇰",
    ];
    for (const q of specialQueries) {
      const res = await getCitySearch(q);
      assert.equal(res.isFallback, true);
      assert.equal(res.disclaimer, SEED_FALLBACK_DISCLAIMER);
      assert.equal(res.sourceId, SLCITIES_SEED_SOURCE_ID);
      assert.ok(Array.isArray(res.hits));
    }
    recordResult("Special Characters & Injection Queries", "Edge Inputs", "PASS", `Tested ${specialQueries.length} adversarial query strings cleanly`);
  } catch (err) {
    recordResult("Special Characters & Injection Queries", "Edge Inputs", "FAIL", errMessage(err));
  }

  // Test 2.4: Non-existent / Malformed Postal Codes
  try {
    const postcodes = [
      "99999",       // Non-existent valid format
      "abcde",       // Non-numeric string -> maps to 00000
      "-123",        // Negative number string -> maps to 00123
      "0",           // Single digit -> maps to 00000
      "99999999",    // Oversized digits -> truncated to 99999
    ];

    for (const pc of postcodes) {
      const res = await lookupPostcode(pc);
      assert.equal(res.isFallback, true);
      assert.equal(res.disclaimer, SEED_FALLBACK_DISCLAIMER);
      assert.equal(res.sourceId, SLCITIES_SEED_SOURCE_ID);
      if (pc === "99999" || pc === "abcde" || pc === "99999999") {
        assert.equal(res.city, null, `Expected null city for postcode '${pc}'`);
      }
    }
    recordResult("Non-existent & Malformed Postcodes", "Edge Inputs", "PASS", `Tested ${postcodes.length} malformed/non-existent postcodes`);
  } catch (err) {
    recordResult("Non-existent & Malformed Postcodes", "Edge Inputs", "FAIL", errMessage(err));
  }

  // -------------------------------------------------------------
  // CATEGORY 3: Radius Search with Boundary Coordinates
  // -------------------------------------------------------------
  console.log("\n--- Category 3: Radius Search Boundary Coordinate Tests ---");

  // Test 3.1: Null Island (0, 0)
  try {
    const res = await getNearbyCities(0, 0, 20);
    assert.equal(res.isFallback, true);
    assert.equal(res.disclaimer, SEED_FALLBACK_DISCLAIMER);
    assert.equal(res.sourceId, SLCITIES_SEED_SOURCE_ID);
    assert.equal(res.center.latitude, 0);
    assert.equal(res.center.longitude, 0);
    assert.equal(res.total, 0, "No Sri Lanka cities within 20km of (0,0)");
    recordResult("Null Island (0,0) Coordinates", "Boundary Coords", "PASS", "Returned 0 cities within 20km");
  } catch (err) {
    recordResult("Null Island (0,0) Coordinates", "Boundary Coords", "FAIL", errMessage(err));
  }

  // Test 3.2: Extreme Lat/Lng Coordinates
  try {
    const extremeCoords = [
      { lat: 90, lng: 180, name: "North Pole / Anti-meridian" },
      { lat: -90, lng: -180, name: "South Pole" },
      { lat: 999, lng: 999, name: "Out of bounds (999,999)" },
      { lat: NaN, lng: NaN, name: "NaN coordinates" },
      { lat: Infinity, lng: -Infinity, name: "Infinity coordinates" },
    ];

    for (const item of extremeCoords) {
      const res = await getNearbyCities(item.lat, item.lng, 50);
      assert.equal(res.isFallback, true);
      assert.equal(res.disclaimer, SEED_FALLBACK_DISCLAIMER);
      assert.equal(res.sourceId, SLCITIES_SEED_SOURCE_ID);
      assert.ok(Array.isArray(res.cities));
    }
    recordResult("Extreme Coordinates (Poles, Out of Bounds, NaN, Infinity)", "Boundary Coords", "PASS", `Tested ${extremeCoords.length} extreme coordinate sets safely`);
  } catch (err) {
    recordResult("Extreme Coordinates (Poles, Out of Bounds, NaN, Infinity)", "Boundary Coords", "FAIL", errMessage(err));
  }

  // Test 3.3: Negative and Zero Radius
  try {
    const resNeg = await getNearbyCities(6.9271, 79.8612, -10);
    assert.equal(resNeg.isFallback, true);
    assert.equal(resNeg.total, 0, "Negative radius must return 0 cities");
    assert.equal(resNeg.radiusKm, -10);

    const resZero = await getNearbyCities(6.9271, 79.8612, 0);
    assert.equal(resZero.isFallback, true);
    assert.equal(resZero.radiusKm, 0);

    recordResult("Negative & Zero Radius Search", "Boundary Coords", "PASS", "Negative (-10km) returned 0 cities, zero (0km) handled safely");
  } catch (err) {
    recordResult("Negative & Zero Radius Search", "Boundary Coords", "FAIL", errMessage(err));
  }

  // -------------------------------------------------------------
  // CATEGORY 4: Verification of Fallback Response Metadata
  // -------------------------------------------------------------
  console.log("\n--- Category 4: Fallback Metadata Properties Audit ---");

  try {
    // 4.1 Check seed fallback metadata across all entry points
    const sSearch = await getCitySearch("Colombo");
    const sPostcode = await lookupPostcode("00100");
    const sNearby = await getNearbyCities(6.9, 79.8, 10);
    const sDistrict = await getDistrictCities("colombo");

    const checkFallbackMetadata = (res: MetaResult, name: string) => {
      assert.equal(res.isFallback, true, `${name}.isFallback should be true`);
      assert.equal(res.disclaimer, "Seed fallback — live API unavailable", `${name}.disclaimer contract mismatch`);
      assert.equal(res.sourceId, "slcities_seed", `${name}.sourceId contract mismatch`);
    };

    checkFallbackMetadata(sSearch, "getCitySearch");
    checkFallbackMetadata(sPostcode, "lookupPostcode");
    checkFallbackMetadata(sNearby, "getNearbyCities");
    checkFallbackMetadata(sDistrict, "getDistrictCities");

    recordResult("Seed Fallback Metadata Compliance", "Fallback Audit", "PASS", "All 4 functions strictly follow fallback metadata contract");
  } catch (err) {
    recordResult("Seed Fallback Metadata Compliance", "Fallback Audit", "FAIL", errMessage(err));
  }

  // 4.2 Check Live API metadata (simulated successful response)
  try {
    globalThis.fetch = (async (url: RequestInfo | URL) => {
      const urlStr = String(url);
      const liveCity = {
        name: "Colombo Live",
        slug: "colombo-live",
        postcode: "00100",
        districtSlug: "colombo",
        districtName: "Colombo",
        province: "Western",
        latitude: 6.9271,
        longitude: 79.8612,
      };
      if (urlStr.includes("/cities/search")) {
        return {
          ok: true,
          json: async () => [liveCity],
        };
      }
      if (urlStr.includes("/cities/postcode/")) {
        return {
          ok: true,
          json: async () => liveCity,
        };
      }
      if (urlStr.includes("/cities/nearby")) {
        return {
          ok: true,
          json: async () => [{ ...liveCity, distanceKm: 0 }],
        };
      }
      if (urlStr.includes("/districts/colombo/cities")) {
        return {
          ok: true,
          json: async () => [liveCity],
        };
      }
      throw new Error("Unhandled mock URL");
    }) as unknown as typeof fetch;

    const lSearch = await getCitySearch("Colombo");
    const lPostcode = await lookupPostcode("00100");
    const lNearby = await getNearbyCities(6.9, 79.8, 10);
    const lDistrict = await getDistrictCities("colombo");

    const checkLiveMetadata = (res: MetaResult, name: string) => {
      assert.equal(res.isFallback, false, `${name}.isFallback should be false for live API`);
      assert.equal(res.disclaimer, null, `${name}.disclaimer should be null for live API`);
      assert.equal(res.sourceId, "slcities_api", `${name}.sourceId should be 'slcities_api'`);
    };

    checkLiveMetadata(lSearch, "getCitySearch");
    checkLiveMetadata(lPostcode, "lookupPostcode");
    checkLiveMetadata(lNearby, "getNearbyCities");
    checkLiveMetadata(lDistrict, "getDistrictCities");

    recordResult("Live API Metadata Compliance", "Fallback Audit", "PASS", "All 4 functions return isFallback=false, disclaimer=null, sourceId='slcities_api' on live hit");
  } catch (err) {
    recordResult("Live API Metadata Compliance", "Fallback Audit", "FAIL", errMessage(err));
  } finally {
    globalThis.fetch = originalFetch;
  }

  // Restore fetch
  globalThis.fetch = originalFetch;

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n=== ADVERSARIAL SUITE SUMMARY ===");
  const total = results.length;
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  console.log(`Total Tests: ${total} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    console.error(`VERDICT: FAILED (${failed} test(s) failed)`);
    process.exit(1);
  } else {
    console.log("VERDICT: CONFIRMED (All empirical adversarial tests passed)");
  }
}

runAdversarialSuite().catch((err) => {
  console.error("Fatal test execution error:", err);
  process.exit(1);
});
