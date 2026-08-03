# Plan: Lankawa Next-Wave Public Data Modules Integration

## Objective
Implement R1 to R5 according to specifications and acceptance criteria through autonomous subagent dispatch.

## Milestone Breakdown

### Milestone 1: Location & District Hierarchy Integration (R1)
- Implement `src/lib/integrations/slcities.ts` consuming `slcities.live/api` & `locatesrilanka.herokuapp.com`.
- Expose city search, postal code lookup, radius proximity resolution (`/cities/nearby`) to district pages (`/districts/[slug]`) and assistant context.
- Graceful fallback to `src/data/districts.json` with disclaimer `"Seed fallback — live API unavailable"`.
- 10s AbortController timeout & revalidate cache.
- `sourceId` registration linking to `/sources/[id]`.

### Milestone 2: Utilities & Energy Outage Monitoring (R2)
- Implement `src/lib/integrations/ceb-outages.ts` parsing CEB Care Incognito outage map (`cebcare.ceb.lk/Incognito/OutageMap`) & load-shedding letter groups (A–Y).
- Surface live power status and scheduled load-shedding breakdown on `/economy` and `/disaster`.
- 10s AbortController timeout & revalidate cache.
- `sourceId` registration linking to `/sources/[id]`.

### Milestone 3: Transport & Aviation Live Operations (R3)
- Implement `src/lib/integrations/aviation.ts` consuming Aviation Edge CMB schedules (`iataCode=CMB`) and SriLankan Airlines fleet status (`airlineIata=UL`).
- Surface live flight arrivals/departures and delay status on `/transport` and `/api/v1/transport`.
- 10s AbortController timeout & revalidate cache.
- `sourceId` registration linking to `/sources/[id]`.

### Milestone 4: Citizen Identity & Holidays Engine (R4)
- Implement `src/lib/integrations/holidays.ts` fetching Sri Lanka Holidays API (`srilanka-holidays.vercel.app/api/v1/holidays`).
- Implement client-side and API NIC validator (`src/lib/nic-decoder.ts`) parsing 9-digit (V/X) and 12-digit NIC formats into birthdate, gender, voting eligibility.
- Surface holiday calendar and NIC utility on `/services` and `/brief/[date]`.
- 10s AbortController timeout & revalidate cache.
- `sourceId` registration linking to `/sources/[id]`.

### Milestone 5: Version Control, Build & Pipeline Verification (R5)
- Git commit and git push for each completed feature module.
- Node test runner verification (`node --experimental-strip-types`).
- Build verification (`node ./node_modules/next/dist/bin/next build`).
- Canary/production update deployment signal.

## Execution Strategy per Milestone
1. Dispatch 3 Explorers (`teamwork_preview_explorer`) to investigate existing code, endpoints, types, and design implementation plan.
2. Synthesize Explorer reports.
3. Dispatch Worker (`teamwork_preview_worker`) to implement code, run tests, and perform git commit/push for the feature module.
4. Dispatch 2 Reviewers (`teamwork_preview_reviewer`) to independently review implementation, test suites, and compliance with Acceptance Criteria.
5. Dispatch 2 Challengers (`teamwork_preview_challenger`) to stress-test endpoints, fallback conditions, and timeout behavior.
6. Dispatch Forensic Auditor (`teamwork_preview_auditor`) to verify zero cheating / fake implementations.
7. Evaluate Gate: if clean, proceed to next milestone.
