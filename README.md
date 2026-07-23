# Lankawa

**Everything public, for every Sri Lankan.**

Lankawa is Sri Lanka's national civic intelligence platform — unifying public data across economy, districts, disasters, and public services with source provenance and freshness on every number.

Maintained by [Ardeno Studio](https://github.com/ArdenoStudio). Repository: [github.com/ArdenoStudio/lankawa](https://github.com/ArdenoStudio/lankawa).

## Modules

- **Pulse** — FX, fuel prices (Octane API), flood station monitoring
- **District Atlas** — All 25 districts with population, area, province
- **Status** — Source health dashboard at `/status`
- **Civic Assistant** — Grounded Q&A at `/assistant`
- **Public API** — `/api/v1/*` with rate limiting and OpenAPI spec

## Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- `next-intl` — English, Sinhala, Tamil
- Python ingest workers + optional Supabase/Postgres persistence
- Vercel cron for daily CBSL FX ingest

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
