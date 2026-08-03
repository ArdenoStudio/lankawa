# Handoff Report — Explorer M1_3 (UI & Page Integration)

## 1. Observation

### 1.1 Existing District Page (`/districts/[slug]`)
- File: `src/app/[locale]/districts/[slug]/page.tsx`
  - Lines 16-17:
    ```typescript
    import { DISTRICTS, getDistrict, getDistrictName } from "@/lib/districts";
    ```
  - Currently imports static `DISTRICTS` and helper functions, but lacks calls to location adapter `src/lib/integrations/slcities.ts`.
  - Lacks city hierarchy listing, postal code chips, nearby proximity search link, location seed fallback disclaimer, and location `sourceId` provenance link.

### 1.2 Missing Nearby Cities Page (`/cities/nearby`)
- Path: `src/app/[locale]/cities/nearby/page.tsx` does NOT exist in the codebase.
- Need: Next.js App Router page to handle city search (`q`), postal code lookup (`postal`), district filter (`district`), and radius proximity search (`lat`, `lng`, `radius`).

### 1.3 Source Registration & Provenance Links (`src/lib/sources.ts`)
- File: `src/lib/sources.ts`
  - `SOURCES` array (lines 3–1080) currently contains definitions for `open_meteo_geocoding`, `census_2024_seed`, `public_services_stub`, etc., but lacks entries for `slcities_api` and `slcities_seed`.
  - `PROVENANCE_ALIASES` (lines 1087–1091) lacks mapping `slcities_seed: "slcities_api"`.
  - Route `/sources/[id]` (`src/app/[locale]/sources/[id]/page.tsx` lines 9-11) uses `generateStaticParams()` over `SOURCES`. Missing `slcities_api` in `SOURCES` causes `/sources/slcities_api` to 404.

### 1.4 Assistant Context Exposure (`src/lib/assistant.ts`)
- File: `src/lib/assistant.ts`
  - `resolveDistrictSlugAsync` (lines 86-106) uses `searchSriLankaPlaces(query)` (Open-Meteo geocoding) as fallback.
  - `ruleBasedAnswer` (lines 150-279) handles FX, fuel, flood, election, district, services, and help queries, but lacks regex handlers for nearby cities, postal codes, and city location search.
  - `llmAnswer` (lines 281-373) builds `contextJson` without city/postal hierarchy data for `scopedDistrict`.

---

## 2. Logic Chain

1. **Location Adapter Integration**:
   - `PROJECT.md` defines Milestone 1 as implementing `src/lib/integrations/slcities.ts`, exposing city search, postal code lookup, and radius proximity (`/cities/nearby`) to district pages (`/districts/[slug]`) and assistant context.
   - For `/districts/[slug]` to reflect live/seed location hierarchy, `DistrictDetailPage` must invoke `fetchDistrictLocationData(slug)` from `slcities.ts` and render city list, postal code list, seed fallback disclaimer, and source link.
   - For `/cities/nearby` to work, `src/app/[locale]/cities/nearby/page.tsx` must be created to receive query params (`lat`, `lng`, `q`, `postal`, `district`) and render results from `slcities.ts`.

2. **Source ID Provenance**:
   - `PROJECT.md` mandates that every displayed metric registers `sourceId` linking to `/sources/[id]`.
   - Registering `slcities_api` and `slcities_seed` in `SOURCES` (`src/lib/sources.ts`) allows `getSourceProvenancePath("slcities_api")` to return `/sources/slcities_api`.
   - Adding `slcities_api` to `SOURCES` enables static params generation in `/sources/[id]/page.tsx`, ensuring proper compilation and rendering of source details.

3. **Seed Fallback Disclaimer**:
   - `PROJECT.md` states: *"Upstream API failures fall back cleanly to static seeds with explicit disclaimer: 'Seed fallback — live API unavailable'"*.
   - When `isSeedFallback` is `true`, both `/districts/[slug]` and `/cities/nearby` must display an alert badge/banner containing verbatim string: `"Seed fallback — live API unavailable"`.

4. **Assistant Exposure**:
   - Exposing city/postal search to `src/lib/assistant.ts` allows the assistant to resolve place queries (e.g. "00100" or "Bambalapitiya") to district slugs, answer location questions directly, and cite `/cities/nearby` and `/districts/[slug]`.

---

## 3. Caveats

- **Unexplored Areas**: Live HTTP behavior of `slcities.live/api` and `locatesrilanka.herokuapp.com` was not tested over network (CODE_ONLY mode read-only investigation).
- **Assumptions**: Assumed static seed fallback dataset for cities and postal codes can be derived from `src/data/districts.json` and bundled seed JSON.
- **Alternative Interpretations**: `getSourceProvenancePath("slcities_seed")` can alias directly to `slcities_api` via `PROVENANCE_ALIASES` so both live and seed paths direct users to `/sources/slcities_api`.

---

## 4. Conclusion

Milestone 1 UI and Page integration requires:
1. Creating `src/app/[locale]/cities/nearby/page.tsx` consuming `src/lib/integrations/slcities.ts`.
2. Updating `src/app/[locale]/districts/[slug]/page.tsx` to display district city hierarchy, postal codes, seed fallback disclaimer banner when active, and source provenance link.
3. Registering `slcities_api` and `slcities_seed` in `SOURCES` (`src/lib/sources.ts`).
4. Extending `src/lib/assistant.ts` with city/postal code lookup, location regex rule answers, and `/cities/nearby` citations.

---

## 5. Verification Method

### 5.1 Project Test Command
- Run integration adapter unit tests:
  ```powershell
  node --experimental-strip-types src/lib/integrations/slcities.test.ts
  ```

### 5.2 Next.js Build Command
- Execute Next.js production build:
  ```powershell
  node ./node_modules/next/dist/bin/next build
  ```

### 5.3 Inspection Verification
- Inspect `src/lib/sources.ts` to confirm `slcities_api` and `slcities_seed` exist in `SOURCES`.
- Inspect `src/app/[locale]/districts/[slug]/page.tsx` to confirm `slcities.ts` invocation, disclaimer `"Seed fallback — live API unavailable"`, and `/sources/slcities_api` link.
- Inspect `src/app/[locale]/cities/nearby/page.tsx` for query parameter handling and disclaimer display.
- Inspect `src/lib/assistant.ts` for location query handlers and citation paths (`/cities/nearby`).

### 5.4 Invalidation Conditions
- Build fails with missing route `/sources/slcities_api`.
- Disclaimer text differs from `"Seed fallback — live API unavailable"`.
- `sourceId` link on district or nearby city page does not navigate to `/sources/slcities_api`.
