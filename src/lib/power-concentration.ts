import { DISTRICTS } from "@/lib/districts";

export interface PowerDistrictConcentration {
  slug: string;
  name: string;
  mentions: number;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Heuristically map CEB (or LECO) affected-area labels onto district slugs
 * by substring match against district name / capital / slug tokens.
 */
export function mapAffectedAreaToDistricts(area: string): string[] {
  const normalized = ` ${normalizeText(area)} `;
  const hits: string[] = [];

  for (const district of DISTRICTS) {
    const tokens = [
      district.name,
      district.capital,
      district.slug.replace(/-/g, " "),
    ].map(normalizeText);

    if (tokens.some((token) => token && normalized.includes(` ${token} `))) {
      hits.push(district.slug);
    }
  }

  // Common CEB Care province / area aliases that omit "District".
  const aliases: Array<[RegExp, string]> = [
    [/\bcolombo\b/, "colombo"],
    [/\bgampaha\b/, "gampaha"],
    [/\bkalutara\b|\bkaluthara\b/, "kalutara"],
    [/\bkandy\b|\bmahanuwara\b/, "kandy"],
    [/\bmatale\b/, "matale"],
    [/\bnuwara\s*eliya\b/, "nuwara-eliya"],
    [/\bgalle\b/, "galle"],
    [/\bmatara\b/, "matara"],
    [/\bhambantota\b/, "hambantota"],
    [/\bjaffna\b/, "jaffna"],
    [/\bkurunegala\b/, "kurunegala"],
    [/\bputtalam\b/, "puttalam"],
    [/\banuradhapura\b/, "anuradhapura"],
    [/\bpolonnaruwa\b/, "polonnaruwa"],
    [/\bbadulla\b/, "badulla"],
    [/\bmonaragala\b|\bmoneragala\b/, "monaragala"],
    [/\bratnapura\b/, "ratnapura"],
    [/\bkegalle\b/, "kegalle"],
    [/\bbatticaloa\b/, "batticaloa"],
    [/\bampara\b/, "ampara"],
    [/\btrincomalee\b/, "trincomalee"],
    [/\bwestern\b/, "colombo"],
  ];

  if (hits.length === 0) {
    for (const [pattern, slug] of aliases) {
      if (pattern.test(normalized) && !hits.includes(slug)) {
        hits.push(slug);
      }
    }
  }

  return hits;
}

/**
 * Rank districts by how often CEB/LECO affected-area strings mention them.
 */
export function powerConcentrationByDistrict(
  affectedAreas: string[],
  limit = 8,
): PowerDistrictConcentration[] {
  const counts = new Map<string, number>();

  for (const area of affectedAreas) {
    const slugs = mapAffectedAreaToDistricts(area);
    for (const slug of slugs) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([slug, mentions]) => {
      const district = DISTRICTS.find((row) => row.slug === slug);
      return {
        slug,
        name: district?.name ?? slug,
        mentions,
      };
    })
    .sort((a, b) => b.mentions - a.mentions || a.name.localeCompare(b.name))
    .slice(0, limit);
}
