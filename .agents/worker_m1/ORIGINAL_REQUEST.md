## 2026-08-03T08:10:33Z
You are worker_m1 for Milestone 1 (R1: Location & District Hierarchy Integration).
Your working directory is c:\Users\suven\Desktop\OneDriveBackupFiles\Documents\ARDENO STUDIO\3 - Platforms & Apps\lankawa-main\lankawa-main\.agents\worker_m1.
Read PROJECT.md at c:\Users\suven\Desktop\OneDriveBackupFiles\Documents\ARDENO STUDIO\3 - Platforms & Apps\lankawa-main\lankawa-main\PROJECT.md and the handoff reports in .agents/explorer_m1_1/handoff.md, .agents/explorer_m1_2/handoff.md, and .agents/explorer_m1_3/handoff.md.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Tasks for Milestone 1:
1. Source Registration: Register `slcities_api` and `slcities_seed` in `src/lib/sources.ts` linked to `/sources/slcities_api` and `/sources/slcities_seed`.
2. Static Seed Data: Create `src/data/districts.json` containing accurate seed data for Sri Lanka's 25 districts, major cities, postal codes, and coordinates.
3. Integration Adapter: Create `src/lib/integrations/slcities.ts` implementing:
   - Primary endpoint: `https://slcities.live/api`
   - Secondary endpoint: `https://locatesrilanka.herokuapp.com`
   - Fallback: `src/data/districts.json`
   - Max 10s AbortController timeout (`AbortSignal.timeout(10_000)`).
   - Revalidation cache config (`{ next: { revalidate: 86400 } }`).
   - Functions: `getCitySearch(query)`, `lookupPostcode(code)`, `getNearbyCities(lat, lng, radiusKm)`, `getDistrictCities(districtSlug)`.
   - When upstream APIs fail/time out, set `isFallback: true` and disclaimer: `"Seed fallback — live API unavailable"`.
   - Register metrics with `sourceId` ('slcities_api' or 'slcities_seed').
4. Adapter Unit Tests: Create `src/lib/integrations/slcities.test.ts`. Use explicit `.ts` relative imports so tests run cleanly with:
   `node --experimental-strip-types src/lib/integrations/slcities.test.ts`
   Run this test command and verify it passes with exit code 0.
5. UI Pages & Components:
   - Create `src/app/[locale]/cities/nearby/page.tsx` for nearby cities, postal lookup, search, with sourceId links to `/sources/[id]` and disclaimer `"Seed fallback — live API unavailable"` when fallback active.
   - Update `src/app/[locale]/districts/[slug]/page.tsx` to display city hierarchy, postal code lookup, and proximity CTA.
6. Assistant Integration: Update `src/lib/assistant.ts` with location search capabilities.
7. Verification & Commit:
   - Run unit test runner: `node --experimental-strip-types src/lib/integrations/slcities.test.ts`.
   - Run git commit: `git add .` and `git commit -m "feat(location): R1 Location & District Hierarchy Integration"`.
   - Run git push (or handle git output if remote is set up).

Write your handoff report to `handoff.md` in your working directory `c:\Users\suven\Desktop\OneDriveBackupFiles\Documents\ARDENO STUDIO\3 - Platforms & Apps\lankawa-main\lankawa-main\.agents\worker_m1\handoff.md`. Include all command outputs, build/test results, and changed file paths.

When complete, send a message to parent (id: 67c2e8b5-d88a-49e8-9331-2846ea5ecb6e).
