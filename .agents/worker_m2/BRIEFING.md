# BRIEFING — 2026-08-03T13:52:00Z

## Mission
Implement Milestone 2 (R2: Utilities & Energy Outage Monitoring) according to task specifications.

## 🔒 My Identity
- Archetype: worker_m2
- Roles: implementer, qa, specialist
- Working directory: c:\Users\suven\Desktop\OneDriveBackupFiles\Documents\ARDENO STUDIO\3 - Platforms & Apps\lankawa-main\lankawa-main\.agents\worker_m2
- Original parent: 67c2e8b5-d88a-49e8-9331-2846ea5ecb6e
- Milestone: Milestone 2 (R2)

## 🔒 Key Constraints
- DO NOT CHEAT. All implementations must be genuine.
- Primary endpoint fetching CEB Care Incognito outage map (`cebcare.ceb.lk/Incognito/OutageMap`) and load-shedding letter groups (A–Y).
- Fallback to `src/data/ceb-outages-seed.json` on network error or timeout.
- AbortController 10s timeout (`AbortSignal.timeout(10_000)`).
- Revalidation cache config (`{ next: { revalidate: 3600 } }`).
- Exported functions: `getLiveOutages()`, `getLoadSheddingSchedule(group)`.
- Disclaimer string when falling back: `"Seed fallback — live API unavailable"`, with `isFallback: true` and `sourceId: "ceb_outages_seed"`.
- Explicit `.ts` relative imports for adapter tests run with `node --experimental-strip-types src/lib/integrations/ceb-outages.test.ts`.

## Current Parent
- Conversation ID: 67c2e8b5-d88a-49e8-9331-2846ea5ecb6e
- Updated: 2026-08-03T13:52:00Z

## Task Summary
- **What to build**: Source registration in `src/lib/sources.ts`, seed data in `src/data/ceb-outages-seed.json`, adapter `src/lib/integrations/ceb-outages.ts`, unit tests `src/lib/integrations/ceb-outages.test.ts`, UI integration in `/economy` and `/disaster` pages.
- **Success criteria**: All code implemented cleanly, tests passing with `node --experimental-strip-types`, git commit & push.

## Change Tracker
- **Files modified**: None yet
- **Build status**: Pending
- **Pending issues**: None

## Quality Status
- **Build/test result**: Untested
- **Lint status**: Untested
- **Tests added/modified**: Pending

## Loaded Skills
- None

## Artifact Index
- `.agents/worker_m2/handoff.md` — Handoff report
