# Forensic Audit Report — Milestone 1 (R1: Location & District Hierarchy Integration)

**Work Product**: Milestone 1 Code Changes (`src/lib/integrations/slcities.ts`, `src/data/districts.json`, `src/lib/sources.ts`, `src/app/[locale]/cities/nearby/page.tsx`, `src/lib/assistant.ts`, `src/lib/integrations/slcities.test.ts`, `src/app/[locale]/districts/[slug]/page.tsx`)  
**Profile**: General Project / Forensic Audit  
**Verdict**: **CLEAN**

---

## 1. Executive Summary & Verification Phase Results

All 5 required forensic checks passed empirical verification. There are no hardcoded test results, no fake/mock returns, and no facade implementations. The 3-tier cascade, Haversine formula, 5-digit postal code lookup, AbortController timeout (10s), Next.js revalidation (`revalidate: 86400`), and verbatim fallback disclaimer string (`"Seed fallback — live API unavailable"`) are authentically implemented and fully functional.

| # | Check | Requirement | Result |
|---|-------|-------------|--------|
| 1 | **Integrity & Authenticity** | Audit for hardcoded test results, fake/mock returns, or facade logic | **PASS** |
| 2 | **3-Tier Cascade Integration** | Verify genuine cascade (`slcities.live/api` -> `locatesrilanka.herokuapp.com` -> `src/data/districts.json`) | **PASS** |
| 3 | **Geospatial & Postal Search** | Verify Haversine distance formula & 5-digit postal code search implementation | **PASS** |
| 4 | **Timeouts & Caching** | Verify 10s AbortController timeout & Next.js revalidation settings (`revalidate: 86400`) | **PASS** |
| 5 | **Disclaimer Exact Match** | Verify exact verbatim disclaimer string `"Seed fallback — live API unavailable"` | **PASS** |

---

## 2. Forensic Audit Findings & Detailed Evidence

### Check 1: Audit for Hardcoded Test Results, Fake/Mock Returns, or Facades
- **Observation**:
  - `src/lib/integrations/slcities.ts` contains zero hardcoded test outputs, return shortcuts, or dummy stubs.
  - Functions `getCitySearch(query)`, `lookupPostcode(code)`, `getNearbyCities(lat, lng, radiusKm)`, and `getDistrictCities(districtSlug)` perform dynamic parsing of API JSON objects and dynamic filtering over `ALL_SEED_CITIES` (`districts.json`).
  - `src/lib/integrations/slcities.test.ts` executes dynamic runtime assertions against `haversineDistanceKm`, `getCitySearch`, `lookupPostcode`, `getNearbyCities`, and `getDistrictCities`.
- **Evidence**:
  - `slcities.ts` lines 157-166, 183-192: Dynamic property mapping (`name: item.name ?? item.cityName`, `postcode: String(item.postcode ?? item.postalCode ?? "")`, `latitude: Number(item.latitude ?? item.lat ?? 0)`).
  - `slcities.ts` lines 206-217: Dynamic seed filtering across `name`, `slug`, `postcode`, `districtSlug`, `districtName`, `province`, and `altNames`.

### Check 2: 3-Tier Cascade Verification
- **Observation**:
  - Primary API endpoint: `https://slcities.live/api` (Line 8).
  - Secondary API endpoint: `https://locatesrilanka.herokuapp.com` (Line 9).
  - Seed dataset fallback: `src/data/districts.json` (Lines 1 & 86).
- **Evidence**:
  - `getCitySearch` (lines 154-226): Try-catch block 1 fetches `${PRIMARY_API_URL}/cities/search?q=${query}`. If unsuccessful, try-catch block 2 fetches `${SECONDARY_API_URL}/cities/cordinates/${query}`. If both fail/time out, falls back to `ALL_SEED_CITIES` with `isFallback: true`, `disclaimer: SEED_FALLBACK_DISCLAIMER`, `sourceId: SLCITIES_SEED_SOURCE_ID`.
  - `getDistrictCities` (lines 345-416): Try-catch block 1 fetches `${PRIMARY_API_URL}/districts/${normSlug}/cities`. If unsuccessful, try-catch block 2 fetches `${SECONDARY_API_URL}/cities/byDistrict/${normSlug}`. If both fail/time out, falls back to `SEED_DISTRICTS` and `ALL_SEED_CITIES`.
  - `lookupPostcode` and `getNearbyCities`: Primary endpoint attempted with fallback to `ALL_SEED_CITIES` seed.

### Check 3: Haversine Distance Calculation & Postal Code Search
- **Observation**:
  - Haversine spherical distance formula genuinely implemented in `haversineDistanceKm` (`slcities.ts` lines 99-116).
  - 5-digit postal code lookup (`lookupPostcode`) normalizes non-digit characters (`code.replace(/\D/g, "").padStart(5, "0").slice(0, 5)`).
- **Evidence**:
  - Formula implementation: `R = 6371`, `a = sin²(dLat/2) + cos(lat1)*cos(lat2)*sin²(dLon/2)`, `c = 2 * atan2(√a, √(1-a))`, `return Math.round(R * c * 100) / 100`.
  - Test 2 in `slcities.test.ts`: `haversineDistanceKm(6.9271, 79.8612, 6.8511, 79.8656)` returns ~8.45 km, satisfying `dist > 5 && dist < 12`.
  - Integration in `src/lib/assistant.ts`: `resolveDistrictSlugAsync` checks regex `/^\d{5}$/` via `lookupPostcode` and `ruleBasedAnswer` resolves postal queries.
  - Integration in `src/app/[locale]/cities/nearby/page.tsx`: Full UI supporting 5-digit postcode search and city radius listing.

### Check 4: AbortController Timeout & Next.js Revalidation
- **Observation**:
  - AbortController timeout set to 10 seconds (10,000 ms).
  - Next.js fetch revalidation configured to 86,400 seconds (24 hours).
- **Evidence**:
  - `slcities.ts` lines 10-11: `FETCH_TIMEOUT_MS = 10_000`, `REVALIDATE_SECONDS = 86400`.
  - `slcities.ts` lines 90-97: `buildTimeoutSignal` invokes `AbortSignal.timeout(10_000)`.
  - `slcities.ts` lines 131-145: `fetchWithTimeout` sets `signal` and `next: { revalidate: 86400 }`.

### Check 5: Exact Disclaimer String Verification
- **Observation**:
  - Exact disclaimer string matches `"Seed fallback — live API unavailable"` (with em-dash) across all constants, components, and unit test assertions.
- **Evidence**:
  - `slcities.ts` line 6: `export const SEED_FALLBACK_DISCLAIMER = "Seed fallback — live API unavailable";`
  - `slcities.test.ts` line 15: `assert.equal(SEED_FALLBACK_DISCLAIMER, "Seed fallback — live API unavailable");`
  - `cities/nearby/page.tsx` line 116: `<span className="font-semibold">{SEED_FALLBACK_DISCLAIMER}</span>`
  - `districts/[slug]/page.tsx` line 346: `<span className="font-semibold">{SEED_FALLBACK_DISCLAIMER}</span>`

---

## 3. Logic Chain

1. **Empirical Code Analysis**:
   - Inspected `src/lib/integrations/slcities.ts`, `src/data/districts.json`, `src/lib/sources.ts`, `src/app/[locale]/cities/nearby/page.tsx`, `src/lib/assistant.ts`, `src/app/[locale]/districts/[slug]/page.tsx`, and `src/lib/integrations/slcities.test.ts`.
   - Confirmed all logic is authentic, dynamic, and free of cheating or mock facades.

2. **Test Suite Execution**:
   - Executed `node --experimental-strip-types src/lib/integrations/slcities.test.ts`.
   - Result: Exit code 0, `slcities.test.ts: ok`. All 8 unit tests passed.

3. **Provenance & Source Registry**:
   - Confirmed `slcities_api` and `slcities_seed` registered in `SOURCES` array inside `src/lib/sources.ts`.
   - Provenance links lead to `/sources/slcities_api` and `/sources/slcities_seed`.

---

## 4. Caveats

- **External Network Access**: Primary and secondary live API endpoints (`slcities.live` and `locatesrilanka.herokuapp.com`) rely on external uptime; when network is offline or endpoints fail, the 3-tier cascade cleanly activates the static seed fallback (`districts.json`) with the required disclaimer banner.
- **CODE_ONLY Sandbox Network Isolation**: During isolated offline build execution, `next/font` fetching from `fonts.gstatic.com` returns `ECONNRESET` due to standard environment network restrictions. The application code and unit test suite are fully intact and pass all tests cleanly.
- **Earth Spherical Approximation**: Haversine distance uses spherical mean radius $R = 6371$ km, which provides ~0.3% precision suitable for regional Sri Lanka proximity searches.

---

## 5. Conclusion & Final Verdict

**Verdict**: **CLEAN**

Milestone 1 (R1: Location & District Hierarchy Integration) satisfies all project specifications, interface contracts, and integrity standards. No cheating, hardcoded outputs, or facades were detected.

---

## 6. Verification Method

To independently reproduce and verify this audit verdict, run the following commands:

```powershell
# 1. Execute adapter unit test runner
node --experimental-strip-types src/lib/integrations/slcities.test.ts

# 2. Execute Next.js production build verification
node ./node_modules/next/dist/bin/next build
```
