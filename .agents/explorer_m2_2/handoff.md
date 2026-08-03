# Handoff Report — Milestone 2: UI Integration & Source Registration (`explorer_m2_2`)

## 1. Observation
- **Existing `/economy` Page**: `src/app/[locale]/economy/page.tsx:273-290` mounts `HouseholdEnergySection` passing `clustersStrip={<DemandMgmtClustersStrip />}`.
- **Existing `DemandMgmtClustersStrip`**: `src/components/DemandMgmtClustersStrip.tsx:11-59` calls `fetchDemandMgmtClustersSnapshot()` and renders group tiles for A–Y with total clusters and customer counts, but lacks schedule time window details and active status badges.
- **Existing `/disaster` Page**: `src/app/[locale]/disaster/page.tsx:58-66` fetches `fetchPowerStatus()` (`sourceId: "ceb_power"`) and `fetchLECOOutages()` (`sourceId: "leco_power"`), rendering a 2-column power status grid (lines 132-226) and district concentration table (lines 229-277).
- **Existing `SOURCES` Registry**: `src/lib/sources.ts:931-955` defines legacy `ceb_power` and `ceb_demand_mgmt_clusters` sources. It does not yet include `ceb_outages_api` and `ceb_outages_seed`.
- **Dynamic Source Pages**: `src/app/[locale]/sources/[id]/page.tsx:9-11` uses `generateStaticParams()` mapping over `SOURCES`. Any new source registered in `src/lib/sources.ts` automatically generates a static `/sources/[id]` page.
- **Fallback Disclaimer Contract**: `PROJECT.md:22` states: `Upstream API failures fall back cleanly to static seeds with explicit disclaimer: "Seed fallback — live API unavailable"`. This exact string is already used in `src/lib/integrations/slcities.ts:6`.

---

## 2. Logic Chain
1. **Observation**: `/economy` and `/disaster` pages currently display power/outage information using legacy or partial components (`DemandMgmtClustersStrip`, `ceb_power`).
2. **Reasoning**: To fulfill Milestone 2 requirements, both pages must incorporate the unified outage data structure (groups A–Y schedule breakdown + live breakdown status) provided by `ceb-outages.ts`.
3. **Observation**: `src/app/[locale]/sources/[id]/page.tsx` relies on `SOURCES` in `src/lib/sources.ts` for static param generation and source detail rendering.
4. **Reasoning**: Registering `ceb_outages_api` and `ceb_outages_seed` in `src/lib/sources.ts` automatically wires `/sources/ceb_outages_api` and `/sources/ceb_outages_seed` into the Next.js routing tree and pulse health tracking without requiring manual page route additions.
5. **Observation**: `PROJECT.md` mandates `"Seed fallback — live API unavailable"` for static seed fallbacks.
6. **Reasoning**: Defining `export const SEED_FALLBACK_DISCLAIMER = "Seed fallback — live API unavailable"` in `src/lib/integrations/ceb-outages.ts` and conditionally rendering an amber warning badge when `snapshot.isSeed === true` guarantees 100% compliance with project rules and honesty standards.

---

## 3. Caveats
- `explorer_m2_1` is concurrently investigating the adapter implementation (`src/lib/integrations/ceb-outages.ts`) and seed JSON structure (`src/data/ceb-outages-seed.json`).
- UI component implementation (`CebLoadSheddingCard.tsx`) should consume the exact return type `CebOutagesSnapshot` from `ceb-outages.ts`.

---

## 4. Conclusion
The UI integration and source registration plan for Milestone 2 is fully defined:
1. **`/economy` Integration**: Replace/upgrade `DemandMgmtClustersStrip` with `CebLoadSheddingCard` inside `HouseholdEnergySection`, displaying scheduled interruption windows and customer counts for letter groups A–Y with Framer Motion drawer detail.
2. **`/disaster` Integration**: Enhance the Power section with `CebLiveOutageStatusCard` and letter group schedule matrix alongside LECO notices and district concentration tables.
3. **Source Registration**: Add `ceb_outages_api` and `ceb_outages_seed` to `SOURCES` in `src/lib/sources.ts`, automatically powering `/sources/ceb_outages_api` and `/sources/ceb_outages_seed`.
4. **Fallback Handling**: Render `"Seed fallback — live API unavailable"` alert banner when operating in seed mode (`isSeed === true`).

---

## 5. Verification Method
1. **Source Registration Verification**:
   - Inspect `src/lib/sources.ts` to confirm `ceb_outages_api` and `ceb_outages_seed` entries exist.
   - Run `node --experimental-strip-types` on source test scripts or verify `getSource("ceb_outages_api")` returns non-null.
2. **UI Component Verification**:
   - Inspect `/economy` page (`src/app/[locale]/economy/page.tsx`) to verify `CebLoadSheddingCard` is mounted.
   - Inspect `/disaster` page (`src/app/[locale]/disaster/page.tsx`) to verify `CebLiveOutageStatusCard` is mounted.
3. **Fallback Disclaimer Verification**:
   - Verify string `"Seed fallback — live API unavailable"` appears in component output when `isSeed === true`.
4. **Build Verification**:
   - Run `node ./node_modules/next/dist/bin/next build` to verify clean build without TypeScript or routing errors.
