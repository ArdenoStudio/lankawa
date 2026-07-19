# Lankawa Deployment Guide

Production deployment targets [Vercel](https://vercel.com) with optional [Supabase](https://supabase.com) or [Neon](https://neon.tech) PostgreSQL. The app **works without any env vars** — database and ingest are enhancements.

## Quick checklist

- [ ] Deploy to Vercel (connect GitHub repo, `main` branch)
- [ ] Run Supabase/Neon migrations (`001_initial.sql`, `002_phase8.sql`)
- [ ] Set Vercel environment variables (see below)
- [ ] Confirm cron: Vercel runs `/api/cron/ingest` daily at 06:00 UTC (`vercel.json`)
- [ ] Optional: GitHub Actions ingest workflow with repository secrets
- [ ] Smoke-test: `/api/v1/status`, `/en/status`, `/en/assistant`

## Environment variables

Set these in **Vercel → Project → Settings → Environment Variables**. Do not commit secrets.

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | For DB | Supabase project URL (PostgREST runtime) |
| `SUPABASE_SERVICE_ROLE_KEY` | For DB | Service role key for ingest + pulse persistence |
| `DATABASE_URL` | Migrations | Direct Postgres connection string (Supabase pooler or Neon) |
| `CRON_SECRET` | Production cron | Bearer token for `/api/cron/ingest` |
| `OCTANE_API_BASE` | Optional | Fuel API base (default: `https://octane-api.fly.dev`) |
| `FLOOD_API_BASE` | Optional | Flood API base (default: `https://lk-flood-api.vercel.app`) |
| `OPENAI_API_KEY` | Optional | Enables LLM mode on civic assistant (strict RAG) |
| `OPENAI_MODEL` | Optional | Model name (default: `gpt-4o-mini`) |
| `BOT_CONTACT_URL` | Optional | Contact URL for robots (default: GitHub repo) |

Copy from `.env.example` for local development:

```bash
cp .env.example .env.local
```

## Supabase setup

1. Create a Supabase project (or use existing Postgres with PostgREST — Supabase is recommended).
2. Enable **PostGIS** extension in SQL editor: `create extension if not exists postgis;`
3. Run migrations in order:
   - `supabase/migrations/001_initial.sql` — sources, observations, source_health
   - `supabase/migrations/002_phase8.sql` — pulse_snapshots, ingest_runs, export_audit, events
4. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose to client)
6. Copy **Database connection string** → `DATABASE_URL` (for local migrations / psql)

### RLS note

Migrations assume service-role access via PostgREST. Do not expose the service role key in client bundles.

## Neon alternative

Neon works as the Postgres backend:

1. Create a Neon project and database.
2. Enable PostGIS: `create extension if not exists postgis;`
3. Run the same SQL migrations via `psql "$DATABASE_URL" -f supabase/migrations/001_initial.sql` etc.
4. For runtime read/write, either:
   - **Option A (recommended):** Use Supabase with Neon as external DB, or
   - **Option B:** Set `DATABASE_URL` for health reporting; configure PostgREST-compatible API for full persistence.

Without Supabase REST vars, pulse persistence and ingest audit are skipped; live fetch fallbacks still work.

## Vercel cron

`vercel.json` schedules daily CBSL FX ingest:

```json
{
  "crons": [{ "path": "/api/cron/ingest", "schedule": "0 6 * * *" }]
}
```

When `CRON_SECRET` is set, Vercel must send `Authorization: Bearer <CRON_SECRET>`. Configure the secret in Vercel env; Vercel Cron automatically attaches it when `CRON_SECRET` is present.

Manual trigger (local or CI):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://lankawa.vercel.app/api/cron/ingest
```

## GitHub Actions ingest

`.github/workflows/ingest.yml` runs daily at 06:00 UTC and on manual dispatch.

Repository secrets (optional):

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `CRON_SECRET`

When secrets are unset, the Python worker logs a warning and exits without persistence — CI still passes.

## API rate limiting

Public `/api/v1/*` routes are limited to **60 requests/minute per IP** via edge middleware. Responses include:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Health endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/health` | Per-source freshness (pulse integrations) |
| `GET /api/v1/status` | Platform health: DB connected, source counts, version |
| `GET /api/v1/pulse/history` | Last 30 days of pulse snapshots (requires DB) |

## Test URLs (production)

Replace host with your deployment:

- Home: `https://lankawa.vercel.app/en`
- Status dashboard: `https://lankawa.vercel.app/en/status`
- Civic assistant: `https://lankawa.vercel.app/en/assistant`
- Platform status: `https://lankawa.vercel.app/api/v1/status`
- Pulse: `https://lankawa.vercel.app/api/v1/pulse`

Trilingual paths: `/en/…`, `/si/…`, `/ta/…`

## Fallback mode

With **no env vars**:

- Pulse uses live Octane, lk-flood-api, and CBSL scrape/fallback
- No pulse history or ingest persistence
- Cron returns 401 if `CRON_SECRET` is set but header missing; otherwise runs without DB write
- Assistant uses rule-based FAQ only (no LLM)

This ensures https://lankawa.vercel.app always serves civic data.
