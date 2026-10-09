import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // Pre-launch F11: serve app/global-not-found.tsx for unmatched routes.
    globalNotFound: true,
  },
  async redirects() {
    return [
      {
        // The homepage is the pulse view; /:locale/pulse never existed as a
        // route, so send it home instead of 404ing.
        source: "/:locale/pulse",
        destination: "/:locale",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=15552000; includeSubDomains",
          },
        ],
      },
      {
        source: "/geo/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

// NOTE (pre-launch P9): Sentry's withSentryConfig wrapper is intentionally
// NOT used — v11's Turbopack config patch breaks next/font/google on
// Next 16.2 ("next/font/google queries have exactly one entry", 12 build
// errors on Vercel). Error tracking is wired manually instead:
//   - server/edge: src/instrumentation.ts -> sentry.server/edge.config.ts
//     (DSN from the SENTRY_DSN runtime env var)
//   - client: <SentryClientInit /> in [locale]/layout.tsx
//     (DSN from NEXT_PUBLIC_SENTRY_DSN, set to the same value)
// Sourcemap upload is skipped (no wrapper, no auth token); stack traces
// still map via the uploaded release artifacts if added later.
export default withNextIntl(nextConfig);

