/**
 * Lankawa brand constants — colors, metadata, and i18n key references.
 * See docs/BRAND.md for usage guidelines.
 */

export const brand = {
  name: "Lankawa",
  taglineKey: "brand.tagline",
  taglineShortKey: "brand.taglineShort",
  missionKey: "brand.mission",
  builtByKey: "brand.builtBy",
} as const;

export const colors = {
  teal: "#0d9488",
  tealBright: "#2dd4bf",
  maroon: "#8b2635",
  gold: "#d4a24c",
  saffron: "#e8a838",
  surface: "#020617",
  surfaceElevated: "#0f172a",
  border: "rgba(255, 255, 255, 0.1)",
} as const;

export const metadata = {
  themeColor: colors.teal,
  backgroundColor: colors.surface,
  ogImage: "/brand/og-default.svg",
  favicon: "/favicon.svg",
  icons: {
    "192": "/icons/icon-192.svg",
    "512": "/icons/icon-512.svg",
  },
} as const;

export const assets = {
  mark: "/brand/mark.svg",
  wordmark: "/brand/wordmark.svg",
  logo: "/brand/logo.svg",
  logoStacked: "/brand/logo-stacked.svg",
} as const;
