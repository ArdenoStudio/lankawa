# Project: Lankawa Next-Wave Public Data Modules Integration

## Architecture
- Framework: Next.js (App Router)
- Integration Adapters: `src/lib/integrations/` (`slcities.ts`, `ceb-outages.ts`, `aviation.ts`, `holidays.ts`), `src/lib/nic-decoder.ts`
- Seed Data: `src/data/` (e.g. `districts.json`)
- UI & API Routes: `/districts/[slug]`, `/cities/nearby`, `/economy`, `/disaster`, `/transport`, `/api/v1/transport`, `/services`, `/brief/[date]`

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Location & District Hierarchy (R1) | `src/lib/integrations/slcities.ts`, `/districts/[slug]`, `/cities/nearby`, static seed fallback | none | DONE |
| 2 | M2: Utilities & Energy Outage (R2) | `src/lib/integrations/ceb-outages.ts`, `/economy`, `/disaster` | none | PLANNED |
| 3 | M3: Transport & Aviation (R3) | `src/lib/integrations/aviation.ts`, `/transport`, `/api/v1/transport` | none | PLANNED |
| 4 | M4: Citizen Identity & Holidays (R4) | `src/lib/integrations/holidays.ts`, `src/lib/nic-decoder.ts`, `/services`, `/brief/[date]` | none | PLANNED |
| 5 | M5: Pipeline Verification & Deployment (R5) | Unit test runner, Next.js build verification, git commit/push per module | M1-M4 | PLANNED |

## Interface Contracts
- AbortController timeout: 10s max on fetch calls
- Revalidate caching on adapters
- Every displayed metric registers sourceId linking to `/sources/[id]`
- Upstream API failures fall back cleanly to static seeds with explicit disclaimer: `"Seed fallback — live API unavailable"`
- Adapter tests runnable via `node --experimental-strip-types`
- Next.js build clean with `node ./node_modules/next/dist/bin/next build`
- Git commit & push for each completed module

## Code Layout
- `src/lib/integrations/` - API adapters and fetchers
- `src/lib/` - Core domain utilities (e.g. `nic-decoder.ts`)
- `src/data/` - Static JSON seeds and fallback datasets
- `src/app/` - Next.js App Router pages and API endpoints
