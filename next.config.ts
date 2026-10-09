import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
// Sentry v11+: the Next.js config wrapper moved to the /config subpath.
import { withSentryConfig } from "@sentry/nextjs/config";

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

// Pre-launch P9: Sentry Next.js plugin. Sourcemap upload is skipped when no
// SENTRY_AUTH_TOKEN is present (warning only); error tracking itself keys off
// the SENTRY_DSN runtime env var and stays disabled until it is set.
export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});

