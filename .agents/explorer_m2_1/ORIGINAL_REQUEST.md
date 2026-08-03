## 2026-08-03T08:18:38Z
You are explorer_m2_1 for Milestone 2 (R2: Utilities & Energy Outage Monitoring).
Your working directory is c:\Users\suven\Desktop\OneDriveBackupFiles\Documents\ARDENO STUDIO\3 - Platforms & Apps\lankawa-main\lankawa-main\.agents\explorer_m2_1.
Read PROJECT.md at c:\Users\suven\Desktop\OneDriveBackupFiles\Documents\ARDENO STUDIO\3 - Platforms & Apps\lankawa-main\lankawa-main\PROJECT.md and ORIGINAL_REQUEST.md.

Task:
Investigate adapter design for `src/lib/integrations/ceb-outages.ts`:
1. Analyze endpoints for CEB Care Incognito outage map (`cebcare.ceb.lk/Incognito/OutageMap`) and load-shedding letter groups (A–Y).
2. Design 10s AbortController timeout, revalidate caching (`revalidate: 3600` or appropriate TTL), and static seed fallback dataset (`src/data/ceb-outages-seed.json`) with exact disclaimer `"Seed fallback — live API unavailable"`.
3. Design adapter functions (e.g. `getLiveOutages()`, `getLoadSheddingSchedule(group)`).
4. Design unit test structure for `ceb-outages.ts` runnable via `node --experimental-strip-types src/lib/integrations/ceb-outages.test.ts`.

Write your findings to `analysis.md` and handoff report `handoff.md` in your working directory.
When complete, send a message to parent (id: 67c2e8b5-d88a-49e8-9331-2846ea5ecb6e).
