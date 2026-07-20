import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const SITE_URL = "https://lankawa.vercel.app";

const MODULE_PATHS = [
  "",
  "about",
  "learn",
  "explore",
  "districts",
  "provinces",
  "elections",
  "elections/history",
  "economy",
  "disaster",
  "cost-of-living",
  "cost-of-living/methodology",
  "services",
  "health",
  "environment",
  "food",
  "property",
  "vehicles",
  "transport",
  "local-government",
  "budget",
  "civic",
  "compare",
  "tenders",
  "sources",
  "status",
  "developers",
  "developers/openapi",
  "developers/api-catalog",
  "developers/api-catalog/pagination-lab",
  "embed",
  "assistant",
  "ardeno",
] as const;

function localizedUrl(locale: string, path: string): string {
  const suffix = path ? `/${path}` : "";
  return `${SITE_URL}/${locale}${suffix}`;
}

function alternates(path: string) {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, localizedUrl(locale, path)]),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const localizedEntries: MetadataRoute.Sitemap = MODULE_PATHS.flatMap((path) =>
    routing.locales.map(
      (locale) =>
        ({
          url: localizedUrl(locale, path),
          lastModified,
          changeFrequency: path === "" ? "daily" : "weekly",
          priority: path === "" ? 1 : 0.7,
          alternates: {
            languages: alternates(path),
          },
        }) satisfies MetadataRoute.Sitemap[number],
    ),
  );

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/feed.xml`,
      lastModified,
      changeFrequency: "hourly",
      priority: 0.6,
    },
    ...localizedEntries,
  ];
}
