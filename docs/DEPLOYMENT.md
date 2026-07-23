# Lankawa Deployment Guide

Production deployment targets [Vercel](https://vercel.com) with optional [Supabase](https://supabase.com) or [Neon](https://neon.tech) PostgreSQL. The app **works without any env vars** — database and ingest are enhancements.

**Project:** [vercel.com/suvenseoras-projects/lankawa](https://vercel.com/suvenseoras-projects/lankawa)  
**Production URL:** [https://lankawa.vercel.app](https://lankawa.vercel.app/en)  
**GitHub repo:** [ArdenoStudio/lankawa](https://github.com/ArdenoStudio/lankawa) (`main`)

## Connect GitHub → Vercel (required for auto-deploy)

If new merges to `main` do not appear on production, Git is not linked (or production was not redeployed). Fix once:

1. Open [Project → Settings → Git](https://vercel.com/suvenseoras-projects/lankawa/settings/git) (or click **Connect Git Repository** on the overview).
2. Connect **`ArdenoStudio/lankawa`**. Production branch must be **`main`**.
3. Confirm **Deploy Hooks / auto-deploy** for the production branch are enabled.
4. Open **Deployments** → deploy the latest `main` commit to **Production** (or push an empty commit after linking).
5. Verify sync:

```bash
npm run check:prod-drift
```

Expected: all local OpenAPI paths present on production; smoke routes (`/en/news`, `/api/v1/news/clusters`, `/embed/widget.js`, …) return 2xx.

### Backup: GitHub Actions deploy (optional)

If you cannot use Vercel Git integration, set these **GitHub repository secrets** and use `.github/workflows/deploy-vercel.yml`:

| Secret | Where to find it |
|--------|------------------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Project → Settings → General → Team/Org ID (also in `.vercel/project.json` after `vercel link`) |
| `VERCEL_PROJECT_ID` | Project → Settings → General → Project ID |

Then either push to `main` or run **Actions → Deploy Vercel → Run workflow**. Prefer Git integration over this backup.

### Drift monitor

`.github/workflows/prod-drift.yml` runs on a schedule and on pushes to `main`. It fails when production OpenAPI/smoke routes lag this repo (no secrets required).

## Quick checklist

- [ ] Connect GitHub repo `ArdenoStudio/lankawa` to Vercel (`main` → Production)
- [ ] Redeploy Production from latest `main`; `npm run check:prod-drift` passes
- [ ] Run Supabase/Neon migrations (`001_initial.sql`, `002_phase8.sql`, optional `003_*`, `004_brief_subscribers.sql`)
- [ ] Set Vercel environment variables (see below)
- [ ] Confirm cron: Vercel runs `/api/cron/ingest` daily at 06:00 UTC (`vercel.json`)
- [ ] Optional morning brief: apply `004_brief_subscribers.sql`, set Resend + site URL, confirm `/api/cron/brief-email`
- [ ] Optional: GitHub Actions ingest workflow with repository secrets
- [ ] Smoke-test: `/api/v1/status`, `/en/status`, `/en/assistant`, `/en/news`

## Environment variables

Set these in **Vercel → Project → Settings → Environment Variables**. Do not commit secrets.

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | For DB | Supabase project URL (PostgREST runtime) |
| `SUPABASE_SERVICE_ROLE_KEY` | For DB | Service role key for ingest + pulse persistence |
| `DATABASE_URL` | Migrations | Direct Postgres connection string (Supabase pooler or Neon) |
| `CRON_SECRET` | Production cron | Required Bearer token for `/api/cron/ingest`, `/api/cron/brief-email`, and `/api/cron/canary` (fail-closed) |
| `OCTANE_API_BASE` | Optional | Fuel API base (default: `https://octane-api.fly.dev`) |
| `FLOOD_API_BASE` | Optional | Flood API base (default: `https://lk-flood-api.vercel.app`) |
| `OPENAI_API_KEY` | Optional | Enables LLM mode on civic assistant (strict RAG) |
| `OPENAI_MODEL` | Optional | Model name (default: `gpt-4o-mini`) |
| `BOT_CONTACT_URL` | Optional | Contact URL for robots (default: GitHub repo) |
| `RESEND_API_KEY` | Brief email | Resend API key for morning-brief delivery |
| `BRIEF_FROM_EMAIL` | Brief email | From header, e.g. `Lankawa <brief@updates.example.com>` |
| `NEXT_PUBLIC_SITE_URL` | Brief email | Canonical site URL used in confirm/unsubscribe links |

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
   - `supabase/migrations/004_brief_subscribers.sql` — morning-brief opt-in table (optional)
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

`vercel.json` schedules:

| Path | Schedule (UTC) | Purpose |
|------|----------------|---------|
| `/api/cron/ingest` | `0 6 * * *` | Daily pulse ingest |
| `/api/cron/brief-email` | `15 0 * * *` | Morning brief email (confirmed subscribers) |
| `/api/cron/canary` | `*/30 * * * *` | Critical-source canary health check |

Cron auth is **fail-closed**: missing `CRON_SECRET` or a mismatched `Authorization` header returns **401**. Vercel must send `Authorization: Bearer <CRON_SECRET>`. Configure the secret in Vercel env; Vercel Cron automatically attaches it when `CRON_SECRET` is present.

Manual trigger (local or CI):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://lankawa.vercel.app/api/cron/ingest
curl -H "Authorization: Bearer $CRON_SECRET" https://lankawa.vercel.app/api/cron/brief-email
curl -H "Authorization: Bearer $CRON_SECRET" https://lankawa.vercel.app/api/cron/canary
```

### Morning-brief email enablement

The subscribe UI and cron are shipped; mail stays off until secrets + migration are present.

1. Apply `supabase/migrations/004_brief_subscribers.sql`.
2. Set `RESEND_API_KEY`, `BRIEF_FROM_EMAIL`, `CRON_SECRET`, and `NEXT_PUBLIC_SITE_URL`.
3. Smoke-test opt-in: `POST /api/v1/subscribe` with `{ "email": "you@example.com", "locale": "en" }`.
4. Open the confirm link from the response/log (or Resend test inbox).
5. Trigger cron once; expect `sent`/`skipped` counts (daily cap 200). Without Resend/DB the route returns a graceful no-op / 503 rather than crashing the site.

## GitHub Actions ingest

`.github/workflows/ingest.yml` runs daily at 06:00 UTC and on manual dispatch.

Repository secrets (optional):

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `CRON_SECRET`

When secrets are unset, the Python worker logs a warning and exits without persistence — CI still passes.

## API rate limiting

Public `/api/v1/*` routes use **per-IP buckets** via edge middleware:

| Bucket | Paths | Limit |
|--------|-------|-------|
| `default` | most `/api/v1/*` | 60 / minute |
| `export` | `/api/v1/export/*` | 20 / minute |
| `assistant` | `/api/v1/assistant` | 20 / minute |
| `subscribe` | `/api/v1/subscribe*` | 10 / minute |

Responses include:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `X-RateLimit-Bucket`

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
- Cron returns 401 if `CRON_SECRET` is missing or the Bearer header does not match (fail-closed)
- Assistant uses rule-based FAQ only (no LLM)

This ensures https://lankawa.vercel.app always serves civic data.
