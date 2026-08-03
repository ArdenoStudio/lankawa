# Handoff Report: CEB Outages Integration Adapter Design (`ceb-outages.ts`)

## 1. Observation
- **Project Structure**:
  - `PROJECT.md` line 13 specifies Milestone 2 scope: `src/lib/integrations/ceb-outages.ts`, `/economy`, `/disaster`.
  - `PROJECT.md` lines 18–25 specify contract rules: 10s AbortController timeout on fetch, revalidate caching, `sourceId` linking, static seed fallback with exact disclaimer `"Seed fallback — live API unavailable"`, adapter unit tests runnable via `node --experimental-strip-types`.
- **Existing CEB Integrations**:
  - `src/lib/integrations/power.ts` line 6: `const CEB_BASE = "https://cebcare.ceb.lk";`
  - `src/lib/integrations/demand-mgmt-clusters.ts` lines 15–41: defines 25 demand management group IDs (`A` through `Y`).
  - `src/data/demand-mgmt-clusters-seed.json`: contains seed data snapshot for letter groups A–Y.
- **Reference Standard**:
  - `src/lib/integrations/slcities.ts` and `src/lib/integrations/slcities.test.ts` implement the established project pattern for timeout signals, fallback disclaimers, Next.js cache revalidation, and standalone node test execution via `node --experimental-strip-types`.

## 2. Logic Chain
1. **Endpoint Analysis**: The CEB Care Incognito portal (`cebcare.ceb.lk/Incognito/OutageMap` and `/Incognito/DemandMgmtSchedule`) relies on ASP.NET MVC anti-forgery tokens (`__RequestVerificationToken`) and cookie headers. The adapter requires session bootstrap fetching of the HTML page before issuing POST/GET requests to `/Incognito/GetProvinces`, `/Incognito/GetAreasByProvince`, `/Incognito/GetOutageLocationsInArea`, `/Incognito/GetLoadSheddingEvents`, and `/Incognito/GetDemandMgmtClusters` for group codes `A` through `Y`.
2. **Resilience & Fallback**: To ensure zero client rendering downtime during CEB API outages or network degradation:
   - All network requests are bounded by `AbortSignal.timeout(10_000)` (10 seconds max).
   - Responses are cached using Next.js `next: { revalidate: 3600 }`.
   - On error or timeout, the adapter catches exceptions and cleanly returns `src/data/ceb-outages-seed.json` with `isFallback: true`, `sourceId: "ceb_outages_seed"`, and exact disclaimer `"Seed fallback — live API unavailable"`.
3. **Adapter Functions**:
   - `getLiveOutages()` aggregates active breakdown/unplanned outages across CEB distribution provinces/areas.
   - `getLoadSheddingSchedule(group)` filters scheduled rotation windows for groups `A` through `Y` or all groups.
4. **Testing**: `src/lib/integrations/ceb-outages.test.ts` imports native `node:assert/strict` and tests output contract fields, fallback handling, group validation, and disclaimers.

## 3. Caveats
- CEB Care Incognito endpoints can change internal parameter names or anti-forgery token HTML field structure without notice; fallback to seed dataset ensures page reliability regardless.
- Live network calls during unit testing will attempt connection to `cebcare.ceb.lk`, falling back seamlessly to `ceb-outages-seed.json` if offline or unreachable.

## 4. Conclusion
The proposed design for `src/lib/integrations/ceb-outages.ts`, `src/data/ceb-outages-seed.json`, and `src/lib/integrations/ceb-outages.test.ts` satisfies all Milestone 2 interface contracts and architectural requirements set in `PROJECT.md`.

## 5. Verification Method
1. Inspect `analysis.md` and `handoff.md` in `.agents/explorer_m2_1/`.
2. Verify exact disclaimer compliance (`"Seed fallback — live API unavailable"`).
3. Verify test runner compatibility with `node --experimental-strip-types src/lib/integrations/ceb-outages.test.ts`.
