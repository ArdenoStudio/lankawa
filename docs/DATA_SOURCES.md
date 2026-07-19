# Data Sources Registry

| ID | Name | Tier | Cadence | URL | Status |
|----|------|------|---------|-----|--------|
| `octane_fuel` | Octane Fuel API | Partner | Weekly | https://octane-api.fly.dev | Live |
| `lk_flood_api` | Sri Lanka Flood API | API | 10 min | https://lk-flood-api.vercel.app | Live |
| `cbsl_fx` | Central Bank FX | Scrape | Daily | https://www.cbsl.gov.lk | Planned ingest |

## Bot Policy

User-Agent: `LankawaBot/1.0 (+https://github.com/SuvenSeo/lankawa)`

- Server-side fetches only
- Conservative cadence
- Exponential backoff on failure
- Never block page loads on remote fetches
