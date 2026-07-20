import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { computeFreshnessTier } from "@/lib/freshness";
import { getSourceProvenancePath } from "@/lib/sources";
import type { FreshnessTier, PulseMetric, SourceHealth } from "@/lib/types";

const NEWS_SOURCE_ID = "news_rss";
const NEWS_CADENCE_MINUTES = 30;
const CACHE_PATH = path.join(process.cwd(), "ingest", "output", "sl_news.json");
const ARCHIVE_PATH = path.join(
  process.cwd(),
  "ingest",
  "output",
  "headlines-7d.json",
);
const ARCHIVE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 12_000;

interface NewsFeedDefinition {
  id: string;
  name: string;
  url: string;
}

export const SL_NEWS_FEEDS = [
  {
    id: "daily_mirror",
    name: "Daily Mirror",
    url: "https://www.dailymirror.lk/rss/breaking_news/108",
  },
  {
    id: "ada_derana",
    name: "Ada Derana",
    url: "https://adaderana.lk/rss.php",
  },
  {
    id: "lankadeepa",
    name: "Lankadeepa",
    url: "https://www.lankadeepa.lk/rss/latest_news/1",
  },
  {
    id: "tamil_guardian",
    name: "Tamil Guardian",
    url: "https://www.tamilguardian.com/rss.xml",
  },
  {
    id: "economynext",
    name: "EconomyNext",
    url: "https://economynext.com/feed/",
  },
  {
    id: "newswire",
    name: "Newswire",
    url: "https://www.newswire.lk/feed/",
  },
  {
    id: "island",
    name: "Island",
    url: "https://island.lk/feed/",
  },
  {
    id: "lbo",
    name: "Lanka Business Online",
    url: "https://www.lankabusinessonline.com/feed/",
  },
  {
    id: "ada_derana_biz",
    name: "Ada Derana Biz",
    url: "https://bizenglish.adaderana.lk/feed/",
  },
  {
    id: "roar",
    name: "Roar Media",
    url: "https://roar.media/english/feed/",
  },
  {
    id: "dmc_rss",
    name: "Disaster Management Centre",
    url: "https://www.dmc.gov.lk/index.php?option=com_content&view=category&id=9&Itemid=274&lang=en&format=feed&type=rss",
  },
] satisfies NewsFeedDefinition[];

export interface NewsHeadline {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
}

export interface NewsFeedHealth {
  feedId: string;
  name: string;
  status: "success" | "error";
  itemCount: number;
  fetchedAt: string;
  error: string | null;
}

export interface NewsPulse {
  sourceId: string;
  fetchedAt: string;
  headlines: NewsHeadline[];
  feedHealth: NewsFeedHealth[];
  provenancePath: string;
}

interface CachePayload {
  sourceId?: string;
  fetchedAt?: string;
  headlines?: Array<{
    title: string;
    url: string;
    published_at?: string;
    publishedAt?: string;
    source: string;
  }>;
  feedHealth?: NewsFeedHealth[];
}

interface HeadlineArchivePayload {
  updatedAt?: string;
  headlines?: Array<{
    title: string;
    url: string;
    published_at?: string;
    publishedAt?: string;
    source: string;
  }>;
}

const RSS_BLOCK_RE = /<rss[\s\S]*?<\/rss>/i;
const ITEM_RE = /<item\b[\s\S]*?<\/item>/gi;
const TAG_RE = (tag: string) =>
  new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");

function getRuntimeNewsFeeds(): NewsFeedDefinition[] {
  const coreFeeds = SL_NEWS_FEEDS.filter(
    (feed) => feed.id === "daily_mirror" || feed.id === "ada_derana",
  );
  const envFeeds = (process.env.NEWS_RSS_FEEDS ?? "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url, index) => ({
      id: `custom_rss_${index + 1}`,
      name: `Custom RSS ${index + 1}`,
      url,
    }));

  const byUrl = new Map<string, NewsFeedDefinition>();
  const defaultFeeds = envFeeds.length > 0 ? coreFeeds : SL_NEWS_FEEDS;
  for (const feed of [...defaultFeeds, ...envFeeds]) {
    byUrl.set(feed.url, feed);
  }

  return [...byUrl.values()];
}

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function stripTags(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function normalizeHeadlineTitle(title: string): string {
  return title
    .normalize("NFKC")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRssDate(value: string | undefined): string {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }

  const normalized = value.replace(" ", "T");
  const fallback = Date.parse(`${normalized}Z`);
  if (!Number.isNaN(fallback)) {
    return new Date(fallback).toISOString();
  }

  return new Date().toISOString();
}

function normalizeHeadline(item: {
  title: string;
  url: string;
  publishedAt?: string;
  published_at?: string;
  source: string;
}): NewsHeadline | null {
  if (!item.title || !item.url) {
    return null;
  }
  return {
    title: item.title,
    url: item.url,
    publishedAt: item.publishedAt ?? item.published_at ?? new Date().toISOString(),
    source: item.source,
  };
}

function parseRssItems(xml: string, sourceId: string): NewsHeadline[] {
  const block = xml.match(RSS_BLOCK_RE)?.[0] ?? xml;
  const items = block.match(ITEM_RE) ?? [];
  const headlines: NewsHeadline[] = [];

  for (const item of items) {
    const title = stripTags(item.match(TAG_RE("title"))?.[1] ?? "");
    const url = stripTags(
      item.match(TAG_RE("link"))?.[1] ??
        item.match(TAG_RE("guid"))?.[1] ??
        "",
    );
    if (!title || !url) {
      continue;
    }

    const publishedRaw =
      item.match(TAG_RE("pubDate"))?.[1] ??
      item.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i)?.[1] ??
      item.match(TAG_RE("updated"))?.[1];

    headlines.push({
      title,
      url,
      publishedAt: parseRssDate(publishedRaw),
      source: sourceId,
    });
  }

  return headlines;
}

async function fetchFeed(
  sourceId: string,
  url: string,
): Promise<NewsHeadline[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: NEWS_CADENCE_MINUTES * 60 },
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml",
        "User-Agent": "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)",
      },
    });

    if (!response.ok) {
      throw new Error(`${sourceId} RSS returned ${response.status}`);
    }

    const xml = await response.text();
    return parseRssItems(xml, sourceId);
  } finally {
    clearTimeout(timeout);
  }
}

function pruneHeadlinesToWindow(
  headlines: NewsHeadline[],
  nowMs = Date.now(),
): NewsHeadline[] {
  const cutoff = nowMs - ARCHIVE_RETENTION_MS;
  const seen = new Set<string>();
  const pruned: NewsHeadline[] = [];

  const sorted = [...headlines].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  for (const headline of sorted) {
    const publishedMs = new Date(headline.publishedAt).getTime();
    if (Number.isNaN(publishedMs) || publishedMs < cutoff) {
      continue;
    }
    const key = headline.url || normalizeHeadlineTitle(headline.title);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    pruned.push(headline);
  }

  return pruned;
}

async function persistHeadlineArchive(headlines: NewsHeadline[]): Promise<void> {
  try {
    const existing = await loadHeadlineArchive();
    const merged = pruneHeadlinesToWindow([...headlines, ...existing]);
    await mkdir(path.dirname(ARCHIVE_PATH), { recursive: true });
    await writeFile(
      ARCHIVE_PATH,
      `${JSON.stringify(
        {
          updatedAt: new Date().toISOString(),
          headlines: merged,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  } catch {
    // File-system archive is best effort for serverless environments.
  }
}

/** Load the rolling 7-day headline archive (empty if missing). */
export async function loadHeadlineArchive(): Promise<NewsHeadline[]> {
  try {
    const raw = await readFile(ARCHIVE_PATH, "utf8");
    const data = JSON.parse(raw) as HeadlineArchivePayload;
    const headlines = (data.headlines ?? [])
      .map((item) => normalizeHeadline(item))
      .filter((item): item is NewsHeadline => item !== null);
    return pruneHeadlinesToWindow(headlines);
  } catch {
    return [];
  }
}

/** Headlines from the 7-day archive published at or after `iso`. */
export async function getHeadlinesSince(iso: string): Promise<NewsHeadline[]> {
  const sinceMs = Date.parse(iso);
  if (Number.isNaN(sinceMs)) {
    return [];
  }
  const archive = await loadHeadlineArchive();
  return archive.filter(
    (headline) => new Date(headline.publishedAt).getTime() >= sinceMs,
  );
}

async function readIngestCache(): Promise<NewsPulse | null> {
  try {
    const raw = await readFile(CACHE_PATH, "utf8");
    const data = JSON.parse(raw) as CachePayload;
    const headlines = (data.headlines ?? [])
      .map((item) => normalizeHeadline(item))
      .filter((item): item is NewsHeadline => item !== null);

    if (!data.fetchedAt || headlines.length === 0) {
      return null;
    }

    return {
      sourceId: data.sourceId ?? NEWS_SOURCE_ID,
      fetchedAt: data.fetchedAt,
      headlines,
      feedHealth: data.feedHealth ?? [],
      provenancePath: getSourceProvenancePath(NEWS_SOURCE_ID),
    };
  } catch {
    return null;
  }
}

async function fetchLiveNewsPulse(): Promise<NewsPulse> {
  const fetchedAt = new Date().toISOString();
  const feeds = getRuntimeNewsFeeds();
  const results = await Promise.allSettled(
    feeds.map((feed) => fetchFeed(feed.id, feed.url)),
  );

  const seen = new Set<string>();
  const headlines: NewsHeadline[] = [];
  const feedHealth: NewsFeedHealth[] = [];

  for (let index = 0; index < results.length; index++) {
    const feed = feeds[index];
    const result = results[index];

    if (result.status === "fulfilled") {
      feedHealth.push({
        feedId: feed.id,
        name: feed.name,
        status: "success",
        itemCount: result.value.length,
        fetchedAt,
        error: null,
      });
      for (const headline of result.value) {
        const normalizedTitle = normalizeHeadlineTitle(headline.title);
        const dedupeKey = normalizedTitle || headline.url;
        if (seen.has(dedupeKey)) {
          continue;
        }
        seen.add(dedupeKey);
        headlines.push(headline);
      }
      continue;
    }

    const reason = result.reason;
    feedHealth.push({
      feedId: feed.id,
      name: feed.name,
      status: "error",
      itemCount: 0,
      fetchedAt,
      error: reason instanceof Error ? reason.message : "Feed fetch failed",
    });
  }

  headlines.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  if (headlines.length === 0) {
    throw new Error("All Sri Lanka news RSS feeds failed");
  }

  const pulseHeadlines = headlines.slice(0, 30);
  await persistHeadlineArchive(pulseHeadlines);

  return {
    sourceId: NEWS_SOURCE_ID,
    fetchedAt,
    headlines: pulseHeadlines,
    feedHealth,
    provenancePath: getSourceProvenancePath(NEWS_SOURCE_ID),
  };
}

function isCacheFresh(fetchedAt: string): boolean {
  const ageMinutes = (Date.now() - new Date(fetchedAt).getTime()) / 60_000;
  return ageMinutes <= NEWS_CADENCE_MINUTES;
}

export async function fetchNewsPulse(): Promise<NewsPulse> {
  const cached = await readIngestCache();
  if (cached && isCacheFresh(cached.fetchedAt)) {
    return cached;
  }

  try {
    return await fetchLiveNewsPulse();
  } catch (error) {
    if (cached) {
      return cached;
    }
    throw error;
  }
}

export function buildNewsPulseMetric(checkedAt: string, pulse: NewsPulse): {
  metric: PulseMetric;
  health: SourceHealth;
} {
  const latestPublished =
    pulse.headlines[0]?.publishedAt ?? pulse.fetchedAt;
  const tier: FreshnessTier = computeFreshnessTier(
    latestPublished,
    NEWS_CADENCE_MINUTES,
    Date.parse(checkedAt),
  );
  const provenancePath = getSourceProvenancePath(NEWS_SOURCE_ID);
  const topHeadline = pulse.headlines[0]?.title ?? "No headlines";

  return {
    metric: {
      id: "news_headlines",
      label: "Sri Lanka news",
      value: String(pulse.headlines.length),
      unit: "headlines",
      observedAt: latestPublished,
      tier,
      sourceId: NEWS_SOURCE_ID,
      provenancePath,
      note: topHeadline,
    },
    health: {
      id: NEWS_SOURCE_ID,
      name: "Sri Lanka news RSS",
      category: "civic",
      tier,
      lastSuccessAt: pulse.fetchedAt,
      lastCheckedAt: checkedAt,
      error: null,
      provenancePath,
    },
  };
}
