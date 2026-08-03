# Codebase Structure Analysis — Milestone 1 (R1: Location & District Hierarchy Integration)

## Executive Summary
This analysis details the current codebase state for Milestone 1 (R1), focusing on district/location datasets, integration adapter conventions, existing route structures, and source provenance registration.

---

## 1. District & Location Data Models & Files

### 1.1 `src/data/districts.json` Status
- **Current Status**: File does **NOT** exist in `src/data/`.
- **Existing Baseline**: District data is currently hardcoded in `src/lib/districts.ts`.
- **Target Requirement for M1**: Create `src/data/districts.json` as a static seed/fallback dataset containing standard Sri Lanka district hierarchy data (slug, English name, Sinhala name, Tamil name, province, capital, population, areaSqKm).

### 1.2 Existing District & Location Files & Types

| File Path | Primary Export / Data Model | Description / Purpose |
|-----------|-----------------------------|-----------------------|
| `src/lib/types.ts` | `District` interface | `{ slug: string; name: string; nameSi: string; nameTa: string; province: string; capital: string; population: number; areaSqKm: number; }` |
| `src/lib/districts.ts` | `DISTRICTS: District[]`, `getDistrict(slug)`, `getDistrictName(district, locale)` | Static array of 25 Sri Lankan districts and retrieval helpers. |
| `src/lib/district-coords.ts` | `DISTRICT_COORDS: Record<string, DistrictCoords>`, `getDistrictCoords(slug)` | Lat/lng capital coordinates (`{ latitude, longitude }`) for Open-Meteo & weather queries. |
| `src/lib/district-geo.ts` | `districtSlugFromPcode(pcode)`, `districtSlugFromName(name)` | Maps P-Codes (`LK11`..`LK92`) and display names to district slugs. |
| `src/lib/district-stats.ts` | `getPopulationDensity`, `getProvinceDistrictCount`, `getProvincePopulationShare` | Math helpers calculating density and province-share percentages. |
| `src/lib/ds-divisions.ts` | `DsDivision` interface, `getDsDivisions()`, `matchDsDivisions(query)` | Handles Divisional Secretariats (DS) mapped to `districtSlug`. Uses `src/data/ds-divisions-seed.json`. |
| `src/data/ds-divisions-seed.json` | JSON seed (`divisions: DsDivision[]`) | Stub gazetteer of DS division names & slugs mapped to admin districts. |
| `src/lib/provinces.ts` | `PROVINCES: Province[]`, `getDistrictsForProvince`, `getProvinceForDistrict` | Defines 9 Sri Lankan provinces and maps province names/slugs to districts. |

---

## 2. Integration Adapter Patterns & Architecture

### 2.1 Target Adapter File for M1
- `src/lib/integrations/slcities.ts` currently does **NOT** exist in `src/lib/integrations/`. It must be implemented in M1 as the primary location & district hierarchy adapter.

### 2.2 Central Source Registry (`src/lib/sources.ts`)
- All metrics and adapters register metadata in `SOURCES: SourceDefinition[]` in `src/lib/sources.ts`.
- **`SourceDefinition` Interface** (`src/lib/types.ts`):
  ```ts
  export interface SourceDefinition {
    id: string;
    name: string;
    category: SourceCategory; // "economy" | "disaster" | "energy" | "environment" | "health" | "civic" | "transport" | "sports"
    url: string;              // Server fetch endpoint / reference URL
    cadenceMinutes: number;   // Ingest / cache frequency
    adapter: "api" | "scrape" | "partner" | "seed" | "computed";
    description: string;
    methodology: string;
    metrics: string[];
  }
  ```
- **Helper Functions**:
  - `getSource(id: string): SourceDefinition | undefined`
  - `getSourceProvenancePath(id: string): string` (Returns `/sources/${id}`)

### 2.3 Fetch, AbortController & Timeout Standards
- **Timeout Pattern**:
  Using `AbortSignal.timeout(ms)` helper functions (e.g. `buildTimeoutSignal(8_000)` seen in `src/lib/integrations/geocode.ts`).
  ```ts
  function buildTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
    if (typeof AbortSignal === "undefined" || !("timeout" in AbortSignal)) {
      return undefined;
    }
    return (AbortSignal as typeof AbortSignal & { timeout(ms: number): AbortSignal }).timeout(timeoutMs);
  }
  ```
- **Max Timeout Rule** (`PROJECT.md`): `10s max` on fetch calls.
- **User-Agent Header**: Custom User-Agent string standard: `LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)`.

### 2.4 Caching Patterns
1. **Next.js Revalidation**: Passed in fetch options `{ next: { revalidate: seconds } }` (e.g., 1800s for weather, 86400s for geocoding).
2. **Response Cache Utility** (`src/lib/api-cache.ts`): `jsonWithCache(body, options)` handles SHA-256 ETag generation and returns HTTP 304 Not Modified or HTTP 200 with `Cache-Control: public, max-age=..., stale-while-revalidate=...`.

### 2.5 Seed Fallback Mechanism
- All adapters wrap network calls in `try/catch`.
- On failure (HTTP errors, timeouts, invalid JSON, network down), adapters fall back cleanly to static JSON seeds in `src/data/`.
- UI/API contracts require returning explicit honesty flags:
  - `isSeed: true` or `isFallback: true`
  - Disclaimer text: `"Seed fallback — live API unavailable"`

---

## 3. Existing Route Structure Analysis

Routes in this Next.js App Router codebase are localized under `src/app/[locale]/...`.

### 3.1 District Routes
- **`src/app/[locale]/districts/page.tsx`**: District index page rendering `DistrictMapLazy` and `DistrictGrid`.
- **`src/app/[locale]/districts/[slug]/page.tsx`**: District detail page.
  - Pre-renders 25 static paths via `generateStaticParams()`.
  - Displays population, area, density, province link, census note (`CensusFootnote`), marine swell (`MarineSwellCard` for coastal districts), flood alerts (`FloodStationList`), land change (`DistrictLandPulse`), election swing (`ElectionSwingChart`), and public services.
- **`src/app/api/v1/districts/route.ts`**: Unlocalized API route returning `{ count: 25, districts: [...] }`.

### 3.2 Cities Routes
- **`src/app/[locale]/cities/nearby/page.tsx`** or **`src/app/cities/nearby/`**: Currently **DOES NOT EXIST**.
- **Requirement for M1**: Must be implemented to support nearby city lookups / location queries (integrating `slcities.ts`).

### 3.3 Provenance Routes
- **`src/app/[locale]/sources/[id]/page.tsx`**: Provenance detail page for registered sources.
  - Pre-renders static paths for all `SOURCES` via `generateStaticParams()`.
  - Displays source name, category label, adapter badge, description, methodology, cadence, last checked timestamp, error messages, and linked metrics.

---

## 4. Key Recommendations for Implementers (M1 / R1)

1. **Create Seed Dataset**: Create `src/data/districts.json` containing structured district records to replace/augment hardcoded `DISTRICTS` array.
2. **Implement `slcities.ts`**: Create `src/lib/integrations/slcities.ts` adhering to adapter rules:
   - Register source `sl_cities` in `src/lib/sources.ts`.
   - Implement max 10s AbortController timeout.
   - Revalidate caching (`next: { revalidate: ... }`).
   - Fall back to `src/data/districts.json` / seed city data with `"Seed fallback — live API unavailable"`.
3. **Implement `/cities/nearby` Route**: Create `src/app/[locale]/cities/nearby/page.tsx` (and API endpoint if needed) to query nearby cities by coordinates/district slug.
4. **Register Source**: Add `sl_cities` source definition to `SOURCES` in `src/lib/sources.ts` linking to `/sources/sl_cities`.
