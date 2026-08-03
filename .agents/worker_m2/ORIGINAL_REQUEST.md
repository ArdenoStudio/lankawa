## 2026-08-03T13:51:55Z

You are worker_m2 for Milestone 2 (R2: Utilities & Energy Outage Monitoring).
Your working directory is c:\Users\suven\Desktop\OneDriveBackupFiles\Documents\ARDENO STUDIO\3 - Platforms & Apps\lankawa-main\lankawa-main\.agents\worker_m2.
Read PROJECT.md at c:\Users\suven\Desktop\OneDriveBackupFiles\Documents\ARDENO STUDIO\3 - Platforms & Apps\lankawa-main\lankawa-main\PROJECT.md and handoff reports in .agents/explorer_m2_1/handoff.md and .agents/explorer_m2_2/handoff.md.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Tasks for Milestone 2:
1. Source Registration: Register `ceb_outages_api` and `ceb_outages_seed` in `src/lib/sources.ts` linked to `/sources/ceb_outages_api` and `/sources/ceb_outages_seed`.
2. Static Seed Data: Create `src/data/ceb-outages-seed.json` with seed outages and load-shedding schedule details for groups A–Y.
3. Integration Adapter: Create `src/lib/integrations/ceb-outages.ts` implementing:
   - Primary endpoint fetching CEB Care Incognito outage map (`cebcare.ceb.lk/Incognito/OutageMap`) and load-shedding letter groups (A–Y).
   - Fallback to `src/data/ceb-outages-seed.json` on network error or timeout.
   - Max 10s AbortController timeout (`AbortSignal.timeout(10_000)`).
   - Revalidation cache config (`{ next: { revalidate: 3600 } }`).
   - Exported functions: `getLiveOutages()`, `getLoadSheddingSchedule(group)`.
   - Exact disclaimer string when falling back: `"Seed fallback — live API unavailable"`, with `isFallback: true` and `sourceId: "ceb_outages_seed"`.
4. Adapter Unit Tests: Create `src/lib/integrations/ceb-outages.test.ts`. Use explicit `.ts` relative imports so tests run with:
   `node --experimental-strip-types src/lib/integrations/ceb-outages.test.ts`
   Run this test command and verify it passes with exit code 0.
5. UI Pages & Components:
   - Update `/economy` (`src/app/[locale]/economy/page.tsx`) to surface live power status and scheduled load-shedding breakdown for letter groups A–Y.
   - Update `/disaster` (`src/app/[locale]/disaster/page.tsx`) to surface live power status, outage map details, sourceId links, and fallback disclaimer banner ("Seed fallback — live API unavailable").
6. Verification & Commit:
   - Run unit test runner: `node --experimental-strip-types src/lib/integrations/ceb-outages.test.ts`.
   - Run git commit: `git add .` and `git commit -m "feat(utilities): R2 Utilities & Energy Outage Monitoring"`.
   - Run git push.

Write your handoff report to `handoff.md` in your working directory `c:\Users\suven\Desktop\OneDriveBackupFiles\Documents\ARDENO STUDIO\3 - Platforms & Apps\lankawa-main\lankawa-main\.agents\worker_m2\handoff.md`. Include all command outputs and changed files.

When complete, send a message to parent (id: 67c2e8b5-d88a-49e8-9331-2846ea5ecb6e).
