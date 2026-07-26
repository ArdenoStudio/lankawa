/**
 * Optional Helakuru Esana headlines (unofficial API).
 *
 * Off by default — Lankawa news strategy is RSS-first
 * (docs/NEWS_RSS_MASTER_PLAN.md). Enable with NEWS_ESANA_ENABLED=true.
 *
 * Upstream: https://github.com/Damantha126/Helakuru-Esana-API
 * Live base: https://esana-api.vercel.app
 */

import type { NewsHeadline } from "@/lib/integrations/news";

const FETCH_TIMEOUT_MS = 10_000;

export const ESANA_API_BASE =
  process.env.NEWS_ESANA_API_BASE ?? "https://esana-api.vercel.app";

export function isEsanaNewsEnabled(): boolean {
  const raw = (process.env.NEWS_ESANA_ENABLED ?? "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

interface EsanaContentBlock {
  data?: string;
  data_en?: string;
}

interface EsanaPost {
  id?: number;
  title?: string;
  title_en?: string;
  link?: string;
  published?: string;
  content?: EsanaContentBlock[];
}

interface EsanaResponse {
  Posts?: EsanaPost[];
  Status?: { success?: boolean; code?: number };
}

export function mapEsanaPostsToHeadlines(
  posts: EsanaPost[],
  fetchedAt: string,
): NewsHeadline[] {
  const headlines: NewsHeadline[] = [];

  for (const post of posts) {
    const title =
      (typeof post.title_en === "string" && post.title_en.trim()) ||
      (typeof post.title === "string" && post.title.trim()) ||
      "";
    const url =
      (typeof post.link === "string" && post.link.trim()) ||
      (typeof post.id === "number"
        ? `https://www.helakuru.lk/esana/news/${post.id}`
        : "");
    if (!title || !url) {
      continue;
    }

    const publishedAt =
      typeof post.published === "string" && post.published.trim()
        ? new Date(post.published.replace(" ", "T") + "+05:30").toISOString()
        : fetchedAt;

    headlines.push({
      title,
      url,
      publishedAt: Number.isFinite(Date.parse(publishedAt))
        ? publishedAt
        : fetchedAt,
      source: "Helakuru Esana",
    });
  }

  return headlines;
}

export async function fetchEsanaHeadlines(): Promise<{
  headlines: NewsHeadline[];
  error: string | null;
}> {
  if (!isEsanaNewsEnabled()) {
    return { headlines: [], error: null };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const fetchedAt = new Date().toISOString();

  try {
    const response = await fetch(`${ESANA_API_BASE}/EsanaV3`, {
      signal: controller.signal,
      next: { revalidate: 1800 },
      headers: {
        Accept: "application/json",
        "User-Agent": "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)",
      },
    });

    if (!response.ok) {
      return {
        headlines: [],
        error: `Esana HTTP ${response.status}`,
      };
    }

    const payload = (await response.json()) as EsanaResponse;
    if (payload.Status && payload.Status.success === false) {
      return { headlines: [], error: "Esana Status.success=false" };
    }

    const posts = Array.isArray(payload.Posts) ? payload.Posts : [];
    return {
      headlines: mapEsanaPostsToHeadlines(posts, fetchedAt),
      error: null,
    };
  } catch (error) {
    return {
      headlines: [],
      error: error instanceof Error ? error.message : "Esana fetch failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}
