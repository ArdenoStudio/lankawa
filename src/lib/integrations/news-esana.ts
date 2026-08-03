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

export const PRIMARY_ESANA_API_BASE =
  process.env.NEWS_ESANA_API_BASE ?? "https://esena-news-api-v3.vercel.app";

export const SECONDARY_ESANA_API_BASE = "https://esana-api.vercel.app";

export function isEsanaNewsEnabled(): boolean {
  const raw = (process.env.NEWS_ESANA_ENABLED ?? "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

interface EsanaContentBlock {
  data?: string;
  data_en?: string;
}

interface EsanaPost {
  id?: number | string;
  title?: string;
  titleSi?: string;
  title_en?: string;
  titleEn?: string;
  link?: string;
  share_url?: string;
  published?: string;
  content?: EsanaContentBlock[] | string[];
}

interface EsanaResponse {
  Posts?: EsanaPost[];
  news_data?: {
    data?: EsanaPost[];
  };
  data?: EsanaPost[];
  Status?: { success?: boolean; code?: number };
}

export function mapEsanaPostsToHeadlines(
  posts: EsanaPost[],
  fetchedAt: string,
): NewsHeadline[] {
  const headlines: NewsHeadline[] = [];

  for (const post of posts) {
    const title =
      (typeof post.titleEn === "string" && post.titleEn.trim()) ||
      (typeof post.title_en === "string" && post.title_en.trim()) ||
      (typeof post.titleSi === "string" && post.titleSi.trim()) ||
      (typeof post.title === "string" && post.title.trim()) ||
      "";

    const url =
      (typeof post.share_url === "string" && post.share_url.trim()) ||
      (typeof post.link === "string" && post.link.trim()) ||
      (post.id !== undefined && post.id !== null && String(post.id).trim()
        ? `https://www.helakuru.lk/esana/news/${post.id}`
        : "");

    if (!title || !url) {
      continue;
    }

    const rawPublished = post.published;
    const publishedAt =
      typeof rawPublished === "string" && rawPublished.trim()
        ? new Date(rawPublished.replace(" ", "T") + "+05:30").toISOString()
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

function extractPostsFromPayload(payload: EsanaResponse | EsanaPost[]): EsanaPost[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload.news_data?.data)) {
    return payload.news_data.data;
  }
  if (Array.isArray(payload.Posts)) {
    return payload.Posts;
  }
  if (Array.isArray(payload.data)) {
    return payload.data;
  }
  return [];
}

async function fetchFromEndpoint(
  baseUrl: string,
  fetchedAt: string,
): Promise<{ headlines: NewsHeadline[]; error: string | null }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const endpointUrl = baseUrl.endsWith("/EsanaV3") || baseUrl.includes("esena-news-api-v3")
    ? baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
    : `${baseUrl}/EsanaV3`;

  try {
    const response = await fetch(endpointUrl, {
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
        error: `Esana HTTP ${response.status} from ${baseUrl}`,
      };
    }

    const payload = (await response.json()) as EsanaResponse | EsanaPost[];
    if ("Status" in payload && payload.Status && payload.Status.success === false) {
      return { headlines: [], error: `Esana Status.success=false from ${baseUrl}` };
    }

    const posts = extractPostsFromPayload(payload);
    if (posts.length === 0) {
      return { headlines: [], error: `Esana returned empty posts array from ${baseUrl}` };
    }

    return {
      headlines: mapEsanaPostsToHeadlines(posts, fetchedAt),
      error: null,
    };
  } catch (error) {
    return {
      headlines: [],
      error: error instanceof Error ? error.message : `Fetch failed for ${baseUrl}`,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchEsanaHeadlines(): Promise<{
  headlines: NewsHeadline[];
  error: string | null;
}> {
  if (!isEsanaNewsEnabled()) {
    return { headlines: [], error: null };
  }

  const fetchedAt = new Date().toISOString();
  const endpointsToTry = [
    PRIMARY_ESANA_API_BASE,
    SECONDARY_ESANA_API_BASE,
  ];

  let lastError: string | null = null;

  for (const baseUrl of endpointsToTry) {
    const result = await fetchFromEndpoint(baseUrl, fetchedAt);
    if (result.headlines.length > 0) {
      return result;
    }
    lastError = result.error;
  }

  return {
    headlines: [],
    error: lastError ?? "All Esana endpoints failed",
  };
}
