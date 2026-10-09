# Lankawa

**Everything public, for every Sri Lankan.**

Lankawa is Sri Lanka's national civic intelligence platform — unifying public data across economy, districts, disasters, and public services with source provenance and freshness on every number.

Maintained by [Ardeno Studio](https://github.com/ArdenoStudio). Repository: [github.com/ArdenoStudio/lankawa](https://github.com/ArdenoStudio/lankawa).

## Modules

- **Pulse** — FX, fuel prices (Octane API), flood station monitoring, regional fuel comparison
- **District Atlas** — All 25 districts with exact Census 2024 population, living conditions and age structure
- **Disaster** — Flood gauges, basin rain watch, landslide advisories, hazard pins on a self-hosted map
- **Status** — Source health dashboard at `/status` with age-honest freshness tiers
- **Civic Assistant** — Grounded Q&A at `/assistant`
- **Public API** — `/api/v1/*` with rate limiting and OpenAPI spec

## Stack

- Next.js 16 (App Router, proxy convention), React 19, TypeScript, Tailwind CSS v4
- `next-intl` — English, Sinhala, Tamil
- Python ingest workers + optional Supabase/Postgres persistence
- Vercel cron for daily CBSL FX ingest
- Census 2024 datasets mirrored from the open `nuuuwan/lk_census_2024` DCS transcription (`npm run update:census`)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en)

## Deployment

Production: [https://lankawa.vercel.app/en](https://lankawa.vercel.app/en) · Vercel project: [suvenseoras-projects/lankawa](https://vercel.com/suvenseoras-projects/lankawa).

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for connecting the GitHub repo (required for auto-deploy), env vars, Supabase/Neon, cron, and `npm run check:prod-drift`.

Copy `.env.example` to `.env.local` for local overrides.

## Morning brief email

The morning civic brief (subscribe → double opt-in → daily email) needs three
things before it can launch — **all currently NEEDS-YOU**:

1. **Verified sender domain in Resend.** Add the domain in the Resend
   dashboard and complete SPF + DKIM verification. Publish a DMARC policy
   (`v=DMARC1; p=quarantine` or `p=reject`) for the domain. Until this is
   done, brief emails will bounce or land in spam.
2. **`RESEND_API_KEY`** set on Vercel (Production) — the Resend API key.
3. **`BRIEF_FROM_EMAIL`** set on Vercel (Production) to the verified sender
   identity, e.g. `Lankawa <brief@updates.lankawa.lk>` (currently a
   placeholder in `.env.example`).

It also requires the Supabase `brief_subscribers` table (see
`supabase/migrations/`). Without the database, subscribe requests return
503 and no emails are queued.

## API (v0.8)

Full catalog: `/api/v1/openapi.json` and `/developers`.

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/status` | Platform health (DB, sources, version) |
| `GET /api/v1/health` | Source freshness registry |
| `GET /api/v1/pulse` | Live pulse snapshot |
| `GET /api/v1/pulse/history` | Pulse history (30 days, requires DB) |
| `GET /api/v1/news` | News pulse / headlines |
| `GET /api/v1/cse` | CSE market snapshot |
| `GET /api/v1/disaster/landslide` | Landslide advisories |
| `GET /api/v1/brief` | Morning civic brief |
| `GET /api/v1/food` | Staple food prices |
| `GET /api/v1/economy/ncpi` | NCPI inflation series |
| `POST /api/v1/assistant` | Civic assistant Q&A |
| `GET /api/v1/districts` | All 25 districts |
| `GET /api/v1/openapi.json` | OpenAPI 3.1 spec |

Public API routes are rate-limited to 60 req/min per IP. See OpenAPI for the full list.

## Principles

1. **Provenance over presentation** — every number has source + timestamp
2. **API-first** — dashboards are one client
3. **Trilingual by default** — en / si / ta
4. **Compose, don't monolith** — integrate Octane, lk-flood-api, lanka_data
5. **Honest about gaps** — show what's missing
6. **Graceful fallback** — DB and LLM are enhancements, not requirements

## Related Projects

- [Octane](https://github.com/ArdenoStudio/octane) — Fuel prices API
- [lk-flood-api](https://lk-flood-api.vercel.app) — Flood monitoring

## License

MIT
