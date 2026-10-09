"use client";

// Pre-launch P9: manual client-side Sentry init.
//
// Sentry's withSentryConfig wrapper is intentionally NOT used (its v11
// Turbopack patch breaks next/font/google on Next 16.2), so the browser SDK
// is initialized here instead. The DSN comes from NEXT_PUBLIC_SENTRY_DSN —
// set it to the same value as the server-side SENTRY_DSN (see .env.example).
// Until set, this is a no-op and the app behaves exactly as before.
import * as Sentry from "@sentry/nextjs";

const FLAG = "__lankawaSentryClientInit";

if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_SENTRY_DSN &&
  !(globalThis as Record<string, unknown>)[FLAG]
) {
  (globalThis as Record<string, unknown>)[FLAG] = true;
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    // No session replay — keep the privacy posture (no PII capture).
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

export function SentryClientInit() {
  return null;
}
