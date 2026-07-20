import researchData from "@/data/civic-research-seed.json";
import { fetchNewsPulse, type NewsHeadline } from "@/lib/integrations/news";

export interface CivicResearchItem {
  id: string;
  org: "CPA" | "Verité" | string;
  title: string;
  url: string;
  publishedAt: string;
  summary: string;
}

export interface CivicResearchSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  isSeed: boolean;
  items: CivicResearchItem[];
}

const seed = researchData as CivicResearchSnapshot;

const CPA_SOURCES = new Set([
  "cpa_rss",
  "centre for policy alternatives",
]);

const VERITE_SOURCES = new Set([
  "verite_rss",
  "verité research",
  "verite research",
]);

function normalizeSource(source: string): string {
  return source.trim().toLowerCase();
}

function orgForHeadline(headline: NewsHeadline): "CPA" | "Verité" | null {
  const key = normalizeSource(headline.source);
  if (CPA_SOURCES.has(key)) {
    return "CPA";
  }
  if (VERITE_SOURCES.has(key)) {
    return "Verité";
  }
  return null;
}

function headlinesToItems(headlines: NewsHeadline[]): CivicResearchItem[] {
  const items: CivicResearchItem[] = [];
  for (const [index, headline] of headlines.entries()) {
    const org = orgForHeadline(headline);
    if (!org) {
      continue;
    }
    items.push({
      id: `civic-live-${org.toLowerCase()}-${index}`,
      org,
      title: headline.title,
      url: headline.url,
      publishedAt: headline.publishedAt,
      summary: `${org} public research feed`,
    });
  }
  return items;
}

/** Live CPA / Verité headlines from the news pulse; seed JSON if feeds empty. */
export async function getCivicResearchSnapshot(): Promise<CivicResearchSnapshot> {
  try {
    const pulse = await fetchNewsPulse();
    const items = headlinesToItems(pulse.headlines).slice(0, 8);
    if (items.length > 0) {
      return {
        sourceId: "civic_research_seed",
        sourceName: "CPA / Verité Research (live RSS)",
        asOf: pulse.fetchedAt.slice(0, 10),
        isSeed: false,
        items,
      };
    }
  } catch {
    // Fall through to seed.
  }

  return seed;
}
