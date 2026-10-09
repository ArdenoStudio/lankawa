// Pre-launch P9: client-side error tracking. The DSN comes from the
// SENTRY_DSN env var — never hardcode it. When unset, the SDK stays
// disabled and the app behaves exactly as before (see `enabled`).
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: !!process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  // No session replay — keep the privacy posture (no PII capture).
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});
