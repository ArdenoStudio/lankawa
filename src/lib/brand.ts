/**
 * Lankawa brand constants — monochrome system.
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
  teal: "#ffffff",
  tealBright: "#f5f5f5",
  maroon: "#a3a3a3",
  gold: "#d4d4d4",
  saffron: "#e5e5e5",
  surface: "#000000",
  surfaceElevated: "#0a0a0a",
  border: "rgba(255, 255, 255, 0.14)",
} as const;

export const metadata = {
  themeColor: "#000000",
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
