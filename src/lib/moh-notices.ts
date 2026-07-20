import mohSeed from "@/data/moh-notices-seed.json";
import {
  fetchNewsPulse,
  type NewsHeadline,
} from "@/lib/integrations/news";

export interface MohNotice {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
}

export interface MohNoticesSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  isSeed: boolean;
  methodologyNote: string;
  notices: MohNotice[];
}

const seed = mohSeed as MohNoticesSnapshot;
const MOH_FEED_IDS = new Set(["moh_rss", "moh_notices"]);

export function getMohNoticesSeed(): MohNoticesSnapshot {
  return seed;
}

function headlinesToNotices(headlines: NewsHeadline[]): MohNotice[] {
  return headlines.map((headline, index) => ({
    id: `moh-live-${index}-${headline.url}`,
    title: headline.title,
    url: headline.url,
    publishedAt: headline.publishedAt,
  }));
}

/** Prefer MoH RSS headlines when the feed is wired; otherwise seed strip. */
export async function getMohNotices(limit = 5): Promise<MohNoticesSnapshot> {
  try {
    const pulse = await fetchNewsPulse();
    const moh = pulse.headlines.filter((headline) =>
      MOH_FEED_IDS.has(headline.source),
    );
    if (moh.length > 0) {
      return {
        sourceId: "moh_rss",
        sourceName: "Ministry of Health RSS",
        asOf: pulse.fetchedAt,
        isSeed: false,
        methodologyNote: seed.methodologyNote,
        notices: headlinesToNotices(moh).slice(0, limit),
      };
    }
  } catch {
    // Fall through to seed.
  }

  return {
    ...seed,
    notices: seed.notices.slice(0, limit),
  };
}
