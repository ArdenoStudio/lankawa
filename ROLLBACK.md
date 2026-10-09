# Rollback Plan — Lankawa

Production: https://lankawa.vercel.app · Vercel project `lankawa`
(suvenseoras-projects) · git-linked to `ArdenoStudio/lankawa` `main`
(auto-deploy on every push to `main`).

## Instant rollback (preferred — no code changes)

Every production deployment is retained by Vercel, so a bad deploy can be
reverted in ~1 minute without touching git:

1. Open the [Vercel dashboard](https://vercel.com/suvenseoras-projects/lankawa)
   → **Deployments**.
2. Find the most recent deployment with status **Ready** that predates the
   bad deploy (note its commit SHA).
3. Open its **⋯** menu → **Promote to Production** (Instant Rollback).
4. Verify: `curl -sI https://lankawa.vercel.app/en | head -1` → `200`,
   and spot-check `/api/v1/pulse` and `/status`.

## Git revert (when the bad change must be undone properly)

1. `git revert <bad-commit-sha>` on `main` (or open a revert PR).
2. Push — Vercel auto-deploys `main` within ~2 minutes.
3. Verify the deployment status is **Ready** and the site responds.

## After any rollback

- [ ] Homepage `/en` returns 200 and renders.
- [ ] `/api/v1/pulse` responds in < 10s.
- [ ] `/status` shows sources healthy.
- [ ] Check Sentry (once DSN is configured) for the error that caused it.
- [ ] Note the incident: what broke, which deploy, what the fix is.

## Notes

- Database: Supabase Postgres is optional — the app degrades to
  git-committed seed data without it, so a rollback never needs a DB
  restore for the site to serve traffic.
- Cron jobs (`/api/cron/*`) run from the promoted deployment, so rolling
  back also rolls back cron code.
- Never force-push `main`; prefer Instant Rollback or `git revert`.
