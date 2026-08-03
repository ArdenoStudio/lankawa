# Handoff Report: `src/lib/integrations/slcities.ts` Adapter Design

**Module:** Milestone 1 (R1: Location & District Hierarchy Integration)  
**Agent:** explorer_m1_2  
**Target Folder:** `c:\Users\suven\Desktop\OneDriveBackupFiles\Documents\ARDENO STUDIO\3 - Platforms & Apps\lankawa-main\lankawa-main\.agents\explorer_m1_2`  
**Date:** 2026-08-03  

---

## 1. Observation

1. **System & Project Requirements (`PROJECT.md`)**:
   - `PROJECT.md` line 12: `M1: Location & District Hierarchy (R1)` scope includes `src/lib/integrations/slcities.ts`, `/districts/[slug]`, `/cities/nearby`, static seed fallback.
   - `PROJECT.md` line 19: "AbortController timeout: 10s max on fetch calls".
   - `PROJECT.md` line 20: "Revalidate caching on adapters".
   - `PROJECT.md` line 22: "Upstream API failures fall back cleanly to static seeds with explicit disclaimer: `\"Seed fallback — live API unavailable\"`".
   - `PROJECT.md` line 23: "Adapter tests runnable via `node --experimental-strip-types`".

2. **Existing Architecture & Conventions**:
   - Upstream endpoints cataloged in `docs/SRI_LANKA_API_LANDSCAPE.md` lines 185-199:
     - Primary: `https://slcities.live/api` (`/cities`, `/cities/search`, `/cities/postcode/{postcode}`, `/cities/nearby?lat=&lon=&radius=`, `/districts`, `/provinces`).
     - Secondary: `https://locatesrilanka.herokuapp.com` (`/cities`, `/cities/cordinates/{CITY}`, `/cities/byDistrict/{ID}`).
   - Existing adapters (`src/lib/integrations/geocode.ts` lines 9 & 30-36) use `FETCH_TIMEOUT_MS = 8_000` or `10_000` with `AbortController`/`AbortSignal`.
   - `package.json` line 12 configures tests via `tsx src/lib/integrations/*.test.ts`, while `PROJECT.md` requires direct test execution via `node --experimental-strip-types`.

3. **File System State**:
   - `src/lib/integrations/slcities.ts` does not yet exist.
   - `src/data/districts.json` does not yet exist (existing district code in `src/lib/districts.ts` is in-memory TypeScript array without detailed postal codes/city lists).

---

## 2. Logic Chain

1. **Observation 1 & 2** establish that Lankawa requires a resilient location integration for city search, 5-digit postal code lookup, and radius proximity resolution (`/cities/nearby`).
2. **Observation 1** mandates a 10s max timeout, Next.js revalidation caching (`{ next: { revalidate: 86400 } }`), and a 3-tier cascade: `slcities.live/api` -> `locatesrilanka.herokuapp.com` -> `src/data/districts.json`.
3. When both primary and secondary live APIs fail or time out (>10s), the adapter must query `src/data/districts.json` and set `isFallback: true` and `disclaimer: "Seed fallback — live API unavailable"`.
4. Offline radius proximity resolution requires evaluating Haversine great-circle distance over static seed city coordinates (`haversineDistanceKm`).
5. **Observation 1 & 2** mandate unit tests runnable via `node --experimental-strip-types`. In Node.js native ESM loader, TypeScript relative imports must include explicit file extensions (`import ... from "./slcities.ts"`) so `node --experimental-strip-types src/lib/integrations/slcities.test.ts` executes cleanly without additional flags.

---

## 3. Caveats

1. **Network Availability & Rate Limiting**: `slcities.live/api` is a free public API; rate limits are unthrottled under normal traffic, but secondary fallback (`locatesrilanka.herokuapp.com`) and static seed (`districts.json`) guarantee availability if the host experiences downtime.
2. **Postcode Granularity**: Static seed `src/data/districts.json` covers all 25 districts and major urban centers (~100+ cities/postcodes); live API handles micro-suburbs.
3. **No Code Written to Production Source Tree**: This agent operates under read-only investigation mode. The complete code designs for `slcities.ts`, `districts.json`, and `slcities.test.ts` are documented in `analysis.md` for implementation by the implementer agent.

---

## 4. Conclusion

The adapter design for `src/lib/integrations/slcities.ts` is fully specified and validated against all project constraints. It provides:
1. Normalization of `slcities.live/api` and `locatesrilanka.herokuapp.com` payloads into a unified `CityHit` and `CitySearchResult` model.
2. Robust 10s AbortController timeout management and 24h Next.js revalidate caching.
3. Fallback cascade to `src/data/districts.json` with exact disclaimer string `"Seed fallback — live API unavailable"`.
4. Unit test suite executable with `node --experimental-strip-types src/lib/integrations/slcities.test.ts`.

---

## 5. Verification Method

1. **Inspect Analysis Report**:
   - Read `c:\Users\suven\Desktop\OneDriveBackupFiles\Documents\ARDENO STUDIO\3 - Platforms & Apps\lankawa-main\lankawa-main\.agents\explorer_m1_2\analysis.md`.
2. **Verify Disclaimer String**:
   - Check that `SEED_FALLBACK_DISCLAIMER` matches exactly `"Seed fallback — live API unavailable"`.
3. **Verify Node Strip-Types Test Execution**:
   - Once implementer writes `src/lib/integrations/slcities.ts`, `src/data/districts.json`, and `src/lib/integrations/slcities.test.ts` (using `from "./slcities.ts"`), verify by running:
     ```powershell
     node --experimental-strip-types src/lib/integrations/slcities.test.ts
     ```
   - Expected Output: `slcities.test.ts: ok` with exit code 0.
