# Milestone 1 UI & Page Integration Analysis

## Executive Summary
This report analyzes the UI and Page integration requirements for Milestone 1 (R1: Location & District Hierarchy Integration). It details how district pages (`/districts/[slug]`) and the newly required nearby city page (`/cities/nearby`) interact with the location adapter (`src/lib/integrations/slcities.ts`), how `sourceId` links to `/sources/[id]` are rendered, how the explicit disclaimer `"Seed fallback — live API unavailable"` is surfaced during static fallback, and how location search & proximity capabilities are exposed to the Lankawa AI assistant context.

---

## 1. Interaction of Pages with Location Adapter (`src/lib/integrations/slcities.ts`)

### 1.1 District Pages (`/districts/[slug]`)
- **Current State**:
  - `src/app/[locale]/districts/[slug]/page.tsx` (lines 16-17) imports static `DISTRICTS` from `@/lib/districts`.
  - Basic population, area, density, province, capital, and election stats are displayed, but there is no integration with `slcities.ts` or city hierarchy/postal code listings.
- **Required Integration**:
  - `DistrictDetailPage` should fetch city hierarchy data for the given `slug` by calling `fetchDistrictLocationData(slug)` from `@/lib/integrations/slcities`.
  - Render a `<DistrictLocationSection>` component displaying:
    1. Major cities/towns in the district with Sinhala (`nameSi`), Tamil (`nameTa`), and English names.
    2. Postal codes within the district.
    3. Proximity search CTA linking to `/cities/nearby?district=${slug}` or coordinate-based search `/cities/nearby?lat=${district.lat}&lng=${district.lng}`.
    4. Provenance link to `/sources/slcities_api`.
    5. Disclaimer banner `"Seed fallback — live API unavailable"` when `isSeedFallback` is `true`.

### 1.2 Nearby Cities Page (`/cities/nearby`)
- **Current State**:
  - Page does NOT exist in `src/app/[locale]/cities/nearby/page.tsx`.
- **Required Implementation**:
  - Create App Router page at `src/app/[locale]/cities/nearby/page.tsx`.
  - Accept search query parameters:
    - `lat`, `lng`: Geolocation coordinates for proximity radius search (default radius 15–50 km).
    - `district`: District slug filter.
    - `q`: Free-text search query for city/town name.
    - `postal`: Postal code lookup parameter.
  - Page behavior:
    1. Call adapter functions in `slcities.ts` (`findNearbyCities`, `searchCities`, `getCityByPostalCode`).
    2. Display search controls (search input, postal code input, radius slider/selector, district dropdown).
    3. Render card grid of matching cities with: distance (km), postal code, district badge, province, and direct link to `/districts/[districtSlug]`.
    4. Render header alert banner when `isSeedFallback` is `true`: `"Seed fallback — live API unavailable"`.
    5. Render source provenance footer linking to `/sources/slcities_api`.

---

## 2. `sourceId` Registration & Links to `/sources/[id]`

### 2.1 Source Registration in `src/lib/sources.ts`
- **Requirement**: `PROJECT.md` mandates that every displayed metric registers `sourceId` linking to `/sources/[id]`.
- **Entries to add in `SOURCES` (`src/lib/sources.ts`)**:
```typescript
{
  id: "slcities_api",
  name: "Sri Lanka Cities & Location API",
  category: "civic",
  url: "https://slcities.live/api",
  cadenceMinutes: 1440,
  adapter: "api",
  description: "Sri Lanka city hierarchy, postal code index, and radius proximity coordinates.",
  methodology: "Lankawa queries slcities.live/api and locatesrilanka.herokuapp.com with a 10s AbortController timeout and revalidate cache. Falls back cleanly to src/data/districts.json seed when unavailable.",
  metrics: ["city_count", "postal_code_count", "nearby_cities"],
},
{
  id: "slcities_seed",
  name: "Sri Lanka Cities & Location Seed Data",
  category: "civic",
  url: "https://lankawa.vercel.app/districts",
  cadenceMinutes: 10080,
  adapter: "seed",
  description: "Static seed snapshot of Sri Lanka districts, cities, and postal codes used as fallback.",
  methodology: "Curated dataset of 25 districts and major cities with postal codes.",
  metrics: ["city_count_seed"],
}
```
- **Provenance Aliasing**:
  - In `PROVENANCE_ALIASES` (`src/lib/sources.ts` line 1087): map `slcities_seed: "slcities_api"`.
  - Calling `getSourceProvenancePath("slcities_api")` or `getSourceProvenancePath("slcities_seed")` resolves to `/sources/slcities_api`.

### 2.2 Link Rendering on Pages
- **District Page (`/districts/[slug]`)**:
  - Render inside `<DistrictLocationSection>`:
    `<Link href={getSourceProvenancePath("slcities_api")} className="text-white underline decoration-white/30 hover:decoration-white">Source: Sri Lanka Cities & Location API</Link>`
- **Nearby Cities Page (`/cities/nearby`)**:
  - Render inside page header/footer:
    `<Link href={getSourceProvenancePath("slcities_api")} className="text-teal-300 hover:text-teal-200">View Source Details (/sources/slcities_api)</Link>`

---

## 3. Seed Fallback Disclaimer Display ("Seed fallback — live API unavailable")

### 3.1 Requirement
- `PROJECT.md` specifies: Upstream API failures must fall back cleanly to static seeds with explicit disclaimer: `"Seed fallback — live API unavailable"`.

### 3.2 Display Specifications
- **Condition**: When `isSeedFallback` property returned by `fetchLocationData()` / `fetchDistrictLocationData()` is `true`.
- **UI Markup**:
```tsx
{locationData.isSeedFallback && (
  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-center gap-2">
    <span className="font-semibold uppercase tracking-wider text-amber-400">Disclaimer</span>
    <span>Seed fallback — live API unavailable</span>
  </div>
)}
```
- **Location on Pages**:
  1. On `/districts/[slug]`: Positioned at the top of the location/cities section.
  2. On `/cities/nearby`: Positioned as a prominent alert banner below the page header.

---

## 4. Assistant Context Requirements

### 4.1 Current Assistant Architecture (`src/lib/assistant.ts`)
- `resolveDistrictSlug`: String matching on district slug, name, `nameSi`, `nameTa`.
- `resolveDistrictSlugAsync`: Async fallback via `searchSriLankaPlaces(query)` (Open-Meteo).
- `buildContext`: Constructs `LankawaContext` with `pulse`, `districts`, `electionWinner`, `servicesCount`, `scopedDistrictSlug`.
- `ruleBasedAnswer`: Matches regex patterns for fuel, FX, floods, elections, services, districts.
- `llmAnswer`: Posts JSON context to OpenAI API when `OPENAI_API_KEY` is present.

### 4.2 Required M1 Enhancements
1. **Place & Postal Code Resolution**:
   - Update `resolveDistrictSlugAsync` to query `slcities.ts` functions (`searchCities`, `getCityByPostalCode`).
   - If user asks about "Bambalapitiya" or postal code "00100", `slcities` resolves city → district slug `colombo`.
2. **Location & Proximity Rule-Based Answers**:
   - Add regex pattern `/nearby|city|cities|postal|location|find city|locate/i` in `ruleBasedAnswer`:
     - Postal code query (e.g. "postal code 20000"): returns exact city and district name with citations:
       - `{ label: "Nearby cities", path: `/cities/nearby?postal=20000` }`
       - `{ label: "District page", path: `/districts/${districtSlug}` }`
     - Nearby cities query (e.g. "cities near Colombo"): calls `findNearbyCities` and returns formatted string of nearest cities with distance (km) and citations:
       - `{ label: "Nearby cities", path: `/cities/nearby?district=${districtSlug}` }`
3. **Context Enrichment for LLM (`llmAnswer`)**:
   - Extend `LankawaContext` to include location hierarchy info when `scopedDistrictSlug` is present:
```typescript
scopedDistrict: scoped ? {
  slug: scoped.slug,
  name: scoped.name,
  province: scoped.province,
  population: scoped.population,
  cities: districtCities.slice(0, 5).map(c => c.name),
  postalCodes: districtPostalCodes.slice(0, 5),
  locationSource: "slcities_api"
} : null
```
   - System prompt instructs LLM to state if data is from seed fallback when `isSeedFallback` is true.

---

## 5. Summary of Recommended Code Changes

| File | Action | Summary |
|---|---|---|
| `src/lib/integrations/slcities.ts` | Create | Location adapter fetching `slcities.live/api` / `locatesrilanka.herokuapp.com` with 10s timeout, revalidate cache, seed fallback (`src/data/districts.json`). |
| `src/lib/sources.ts` | Update | Register `slcities_api` and `slcities_seed` in `SOURCES` array and `PROVENANCE_ALIASES`. |
| `src/app/[locale]/districts/[slug]/page.tsx` | Update | Import `slcities.ts`, fetch location hierarchy, render city list, postal codes, nearby CTA, provenance link, and seed fallback disclaimer. |
| `src/app/[locale]/cities/nearby/page.tsx` | Create | New page for city search, postal code lookup, and radius proximity with fallback banner and source links. |
| `src/lib/assistant.ts` | Update | Integrate `slcities.ts` for city/postal resolution, location queries, citation paths (`/cities/nearby`), and enriched LLM context. |
