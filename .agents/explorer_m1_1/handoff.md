# Handoff Report — Milestone 1 (R1: Location & District Hierarchy Integration)

## 1. Observation
- **Missing Files**:
  - `src/data/districts.json` does not exist (`open c:/Users/.../src/data/districts.json: The system cannot find the file specified`).
  - `src/lib/integrations/slcities.ts` does not exist in `src/lib/integrations/`.
  - `src/app/[locale]/cities/nearby` or `src/app/cities/` routes do not exist.
- **Existing District Files & Types**:
  - `src/lib/districts.ts` lines 3–29: Exports hardcoded `DISTRICTS: District[]` array containing 25 districts (`colombo`, `gampaha`, `kalutara`, `kandy`, etc.). Lines 31–43: `getDistrict(slug)`, `getDistrictName(district, locale)`.
  - `src/lib/types.ts` lines 51–60: `export interface District { slug: string; name: string; nameSi: string; nameTa: string; province: string; capital: string; population: number; areaSqKm: number; }`.
  - `src/lib/district-coords.ts` lines 5–31: `DISTRICT_COORDS` map with capital coordinates (`latitude`, `longitude`).
  - `src/lib/district-geo.ts` lines 1–27: `DISTRICT_PCODE_TO_SLUG` mapping P-Codes (`LK11`..`LK92`) to district slugs.
  - `src/lib/ds-divisions.ts` & `src/data/ds-divisions-seed.json`: DS division interfaces, gazetteer stub and search matchers.
  - `src/lib/provinces.ts` lines 11–66: Defines 9 Sri Lankan provinces (`PROVINCES`) and district-province lookup helpers.
- **Integrations & Source Registry**:
  - `src/lib/sources.ts` lines 3–1080: Central source registry exporting `SOURCES: SourceDefinition[]` (40+ sources registered) and helpers `getSource(id)`, `getSourceProvenancePath(id)`.
  - `src/lib/integrations/geocode.ts` lines 30–37 & 125: Timeout signal handling using `AbortSignal.timeout(ms)` (`FETCH_TIMEOUT_MS = 8_000`) and Next.js revalidation `{ next: { revalidate: 86400 } }`.
  - `src/lib/api-cache.ts` lines 4–38: `jsonWithCache()` function providing SHA-256 ETag generation and HTTP `Cache-Control` (`public, max-age=..., stale-while-revalidate=...`).
- **Existing Routes**:
  - `src/app/[locale]/districts/page.tsx`: Index page for districts.
  - `src/app/[locale]/districts/[slug]/page.tsx` lines 49–51 & 62–157: Static params generation for 25 districts, rendering district detail card, marine swell, flood levels, land pulse, etc.
  - `src/app/api/v1/districts/route.ts`: API endpoint returning `{ count, districts }`.
  - `src/app/[locale]/sources/[id]/page.tsx` lines 9–11 & 20–31: Static params generation for source IDs, fetching source definitions and pulse snapshot health.

---

## 2. Logic Chain
1. **Observation**: `src/data/districts.json` is missing, but `src/lib/districts.ts` hardcodes `DISTRICTS` array.
   - **Reasoning**: District data is currently embedded in TypeScript code instead of an external JSON seed file. `PROJECT.md` scope for M1 specifies `src/data/districts.json` as a seed data fallback target.
2. **Observation**: `src/lib/integrations/slcities.ts` does not exist, while other adapters in `src/lib/integrations/` follow a uniform pattern (e.g. `geocode.ts`).
   - **Reasoning**: `slcities.ts` is the planned M1 adapter. It must be created following the existing adapter pattern: registering `sl_cities` in `src/lib/sources.ts`, enforcing 10s max AbortController timeout, setting Next.js revalidate caching, and providing seed fallback handling.
3. **Observation**: `/cities/nearby` route does not exist, while `districts` and `sources` exist under localized App Router directory `src/app/[locale]/`.
   - **Reasoning**: The new `/cities/nearby` route must be placed under `src/app/[locale]/cities/nearby/page.tsx` to match the project's localized route architecture (`[locale]`).
4. **Observation**: `src/lib/sources.ts` exports `getSource(id)` and `getSourceProvenancePath(id)` which links to `/sources/[id]`.
   - **Reasoning**: Any new metric or adapter added in M1 (e.g., `sl_cities` / location metrics) must register its `SourceDefinition` in `SOURCES` inside `src/lib/sources.ts` to integrate into `/sources/[id]` provenance pages.

---

## 3. Caveats
- No live external API endpoint URL was explicitly specified in `PROJECT.md` for `slcities.ts`; implementers will need to configure the endpoint or handle primary fallback gracefully against `src/data/districts.json` and city seeds.
- Non-localized API routes (`src/app/api/v1/...`) do not use `[locale]`, whereas UI page routes do use `src/app/[locale]/...`. Implementers must ensure route placements adhere to this convention.

---

## 4. Conclusion
The codebase infrastructure is fully prepared for Milestone 1 (R1) implementation:
1. `src/data/districts.json` must be created to seed district data.
2. `src/lib/integrations/slcities.ts` must be created following existing integration patterns (`AbortController` timeout <=10s, Next.js `revalidate`, seed fallback disclaimers).
3. `sl_cities` source must be registered in `src/lib/sources.ts`.
4. UI route `src/app/[locale]/cities/nearby/page.tsx` (and any necessary API route `/api/v1/cities/nearby`) must be implemented.

---

## 5. Verification Method
1. **File Existence Inspection**:
   - Verify creation of `src/data/districts.json`.
   - Verify creation of `src/lib/integrations/slcities.ts`.
   - Verify creation of `src/app/[locale]/cities/nearby/page.tsx`.
2. **TypeScript / Lint Verification**:
   - Run `npx tsc --noEmit` or `npm run lint` to ensure types align with `District` and `SourceDefinition` interfaces in `src/lib/types.ts`.
3. **Source Provenance Verification**:
   - Inspect `SOURCES` in `src/lib/sources.ts` to confirm `sl_cities` source ID registration and test resolution via `getSource("sl_cities")`.
