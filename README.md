# Lankawa

**Everything public, for every Sri Lankan.**

Lankawa is Sri Lanka's national civic intelligence platform — unifying public data across economy, districts, disasters, and public services with source provenance and freshness on every number.

## Modules (Phase 1 MVP)

- **Pulse** — FX, fuel prices (Octane API), flood station monitoring
- **District Atlas** — All 25 districts with population, area, province
- **Disaster** — Flood alert summary via [lk-flood-api](https://lk-flood-api.vercel.app)
- **Public API** — `/api/v1/health`, `/api/v1/pulse`, `/api/v1/districts`

## Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- `next-intl` — English, Sinhala, Tamil
- Python ingest workers (ported from lanka-monitor patterns)
- PostgreSQL + PostGIS (planned via Supabase/Neon)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en)

## Environment

Copy `.env.example` to `.env.local`:

```bash
OCTANE_API_BASE=https://octane-api.fly.dev
FLOOD_API_BASE=https://lk-flood-api.vercel.app
DATABASE_URL=postgresql://...
BOT_CONTACT_URL=https://github.com/SuvenSeo/lankawa
```

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/health` | Source freshness registry |
| `GET /api/v1/pulse` | Live pulse snapshot |
| `GET /api/v1/districts` | All 25 districts |
| `GET /api/v1/districts/{slug}` | Single district profile |
| `GET /api/v1/openapi.json` | OpenAPI 3.1 spec |

## Principles

1. **Provenance over presentation** — every number has source + timestamp
2. **API-first** — dashboards are one client
3. **Trilingual by default** — en / si / ta
4. **Compose, don't monolith** — integrate Octane, lk-flood-api, lanka_data
5. **Honest about gaps** — show what's missing

## Related Projects

- [lanka-monitor](https://github.com/Cookie-Cat21/lanka-monitor) — Daily pulse module (Ovindu)
- [Octane](https://github.com/ArdenoStudio/octane) — Fuel prices API
- [lk-flood-api](https://lk-flood-api.vercel.app) — Flood monitoring

## License

MIT
