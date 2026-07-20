import type { NewsHeadline } from "@/lib/integrations/news";
import type { District } from "@/lib/types";

const MARKET_PRESS_SOURCES = new Set(["lbo", "ada_derana_biz"]);

function normalizeHaystack(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^a-z0-9\u0d80-\u0dff\u0b80-\u0bff\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Keyword match: district English / SI / TA / capital names in headline title. */
export function headlineMentionsDistrict(
  title: string,
  district: Pick<District, "name" | "nameSi" | "nameTa" | "capital" | "slug">,
): boolean {
  const haystack = ` ${normalizeHaystack(title)} `;
  const needles = [
    district.name,
    district.nameSi,
    district.nameTa,
    district.capital,
    district.slug.replace(/-/g, " "),
  ]
    .map(normalizeHaystack)
    .filter((needle) => needle.length >= 3);

  return needles.some((needle) => haystack.includes(` ${needle} `));
}

export function filterDistrictPressHeadlines(
  headlines: NewsHeadline[],
  district: Pick<District, "name" | "nameSi" | "nameTa" | "capital" | "slug">,
  limit = 5,
): NewsHeadline[] {
  return headlines
    .filter((headline) => headlineMentionsDistrict(headline.title, district))
    .slice(0, limit);
}

export function filterMarketsPressHeadlines(
  headlines: NewsHeadline[],
  limit = 6,
): NewsHeadline[] {
  return headlines
    .filter((headline) => MARKET_PRESS_SOURCES.has(headline.source))
    .slice(0, limit);
}

export function isMarketsPressSource(sourceId: string): boolean {
  return MARKET_PRESS_SOURCES.has(sourceId);
}
