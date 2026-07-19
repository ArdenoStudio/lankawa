import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchNewsPulse, type NewsHeadline } from "@/lib/integrations/news";
import { clusterHeadlines } from "@/lib/integrations/news-cluster";
import { getSourceProvenancePath } from "@/lib/sources";

const BRIEF_CACHE_PATH = path.join(process.cwd(), "ingest", "output", "brief.json");
const BRIEF_CADENCE_MINUTES = 30;
const NEWS_SOURCE_ID = "news_rss";
const FETCH_TIMEOUT_MS = 15_000;

const SUPPORTED_LOCALES = ["en", "si", "ta"] as const;

export type MorningBriefLocale = (typeof SUPPORTED_LOCALES)[number];
export type MorningBriefQuality = "pass" | "fail";

export interface MorningBrief {
  generatedAt: string;
  locale: MorningBriefLocale;
  bullets: string[];
  topics: string[];
  sourceHeadlineCount: number;
  quality: MorningBriefQuality;
  provenancePath: string;
}

interface BriefCachePayload {
  briefs?: Partial<Record<MorningBriefLocale, MorningBrief>>;
  locale?: MorningBriefLocale;
  bullets?: string[];
  topics?: string[];
  generatedAt?: string;
  sourceHeadlineCount?: number;
  quality?: MorningBriefQuality;
  provenancePath?: string;
}

type TopicId = "politics" | "economy" | "weather_disaster" | "sports" | "other";

const TOPIC_KEYWORDS: Record<TopicId, string[]> = {
  politics: [
    "election",
    "president",
    "parliament",
    "minister",
    "cabinet",
    "government",
    "ජනාධිපති",
    "පාර්ලිමේන්තු",
    "ඇමති",
    "ජනපති",
    "அரசு",
    "ஜனாதிபதி",
    "பாராளுமன்ற",
    "அமைச்சர்",
  ],
  economy: [
    "economy",
    "rupee",
    "inflation",
    "budget",
    "tax",
    "price",
    "market",
    "central bank",
    "ආර්ථික",
    "රුපියල්",
    "මිල",
    "බදු",
    "பொருளாதாரம்",
    "ரூபாய்",
    "விலை",
    "வரி",
  ],
  weather_disaster: [
    "weather",
    "rain",
    "flood",
    "landslide",
    "disaster",
    "warning",
    "storm",
    "වැසි",
    "ගංවතුර",
    "නායයෑ",
    "අනතුරු",
    "மழை",
    "வெள்ளம்",
    "எச்சரிக்கை",
    "பேரிடர்",
  ],
  sports: [
    "cricket",
    "match",
    "series",
    "football",
    "sports",
    "ක්‍රිකට්",
    "තරග",
    "ක්‍රීඩා",
    "கிரிக்கெட்",
    "போட்டி",
    "விளையாட்டு",
  ],
  other: [],
};

const memoryBriefCache = new Map<MorningBriefLocale, MorningBrief>();

function normalizeLocale(locale: string | undefined): MorningBriefLocale {
  const normalized = locale?.split("-")[0]?.toLowerCase();
  return SUPPORTED_LOCALES.includes(normalized as MorningBriefLocale)
    ? (normalized as MorningBriefLocale)
    : "en";
}

function isFresh(generatedAt: string): boolean {
  const ageMinutes = (Date.now() - new Date(generatedAt).getTime()) / 60_000;
  return ageMinutes <= BRIEF_CADENCE_MINUTES;
}

function titleText(headline: NewsHeadline): string {
  return headline.title.replace(/\s+/g, " ").trim();
}

function classifyHeadline(title: string): TopicId {
  const lower = title.toLowerCase();
  for (const topic of Object.keys(TOPIC_KEYWORDS) as TopicId[]) {
    if (topic === "other") {
      continue;
    }
    if (TOPIC_KEYWORDS[topic].some((keyword) => lower.includes(keyword))) {
      return topic;
    }
  }
  return "other";
}

function truncate(value: string, maxLength = 150): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1).trim()}...`;
}

function buildHeuristicBrief(
  headlines: NewsHeadline[],
  locale: MorningBriefLocale,
): MorningBrief {
  // Prefer keyword topic buckets; fall back to title-similarity clusters (E2 lite).
  const groups = new Map<TopicId, NewsHeadline[]>();
  for (const headline of headlines) {
    const title = titleText(headline);
    if (!title) {
      continue;
    }
    const topic = classifyHeadline(title);
    groups.set(topic, [...(groups.get(topic) ?? []), headline]);
  }

  let rankedTopics = [...groups.entries()]
    .filter(([, items]) => items.length > 0)
    .sort((a, b) => b[1].length - a[1].length);

  if (rankedTopics.length < 2) {
    rankedTopics = clusterHeadlines(headlines, 0.35)
      .slice(0, 4)
      .map((cluster) => ["other" as TopicId, cluster.headlines]);
  }

  const bullets = rankedTopics.slice(0, 4).map(([topic, items]) => {
    const leadTitles = items.slice(0, 2).map((item) => truncate(titleText(item), 95));
    const label = topic === "weather_disaster" ? "weather/disaster" : topic;
    return `${label}: ${leadTitles.join("; ")}.`;
  });

  for (const headline of headlines) {
    if (bullets.length >= 4) {
      break;
    }
    const title = titleText(headline);
    if (title && !bullets.some((bullet) => bullet.includes(truncate(title, 95)))) {
      bullets.push(`Also watch: ${truncate(title, 120)}.`);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    locale,
    bullets,
    topics: rankedTopics.map(([topic]) => topic),
    sourceHeadlineCount: headlines.length,
    quality: "pass",
    provenancePath: getSourceProvenancePath(NEWS_SOURCE_ID),
  };
}

function isUrlDump(value: string): boolean {
  const trimmed = value.trim();
  const urls = trimmed.match(/https?:\/\/\S+/gi) ?? [];
  if (/^https?:\/\/\S+$/i.test(trimmed)) {
    return true;
  }
  const textWithoutUrls = trimmed.replace(/https?:\/\/\S+/gi, "").trim();
  return urls.length > 0 && textWithoutUrls.length < 24;
}

function passesQualityGate(
  brief: MorningBrief,
  headlines: NewsHeadline[],
): boolean {
  if (brief.bullets.length < 3) {
    return false;
  }
  if (headlines.some((headline) => !titleText(headline))) {
    return false;
  }
  return brief.bullets.every(
    (bullet) => bullet.trim().length > 0 && !isUrlDump(bullet),
  );
}

function minimalBrief(locale: MorningBriefLocale): MorningBrief {
  return {
    generatedAt: new Date().toISOString(),
    locale,
    bullets: ["Headlines unavailable. Check the Sri Lanka news source page for the latest feed status."],
    topics: ["other"],
    sourceHeadlineCount: 0,
    quality: "fail",
    provenancePath: getSourceProvenancePath(NEWS_SOURCE_ID),
  };
}

function isMorningBrief(value: unknown): value is MorningBrief {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as MorningBrief;
  return (
    typeof candidate.generatedAt === "string" &&
    SUPPORTED_LOCALES.includes(candidate.locale) &&
    Array.isArray(candidate.bullets) &&
    Array.isArray(candidate.topics) &&
    typeof candidate.sourceHeadlineCount === "number" &&
    (candidate.quality === "pass" || candidate.quality === "fail") &&
    typeof candidate.provenancePath === "string"
  );
}

async function readCachedBrief(
  locale: MorningBriefLocale,
): Promise<MorningBrief | null> {
  const memoryCached = memoryBriefCache.get(locale);
  if (memoryCached) {
    return memoryCached;
  }

  try {
    const raw = await readFile(BRIEF_CACHE_PATH, "utf8");
    const data = JSON.parse(raw) as BriefCachePayload;
    const cached = data.briefs?.[locale] ?? (data.locale === locale ? data : null);
    if (!isMorningBrief(cached)) {
      return null;
    }
    memoryBriefCache.set(locale, cached);
    return cached;
  } catch {
    return null;
  }
}

async function writeCachedBrief(brief: MorningBrief): Promise<void> {
  memoryBriefCache.set(brief.locale, brief);

  try {
    let existing: BriefCachePayload = {};
    try {
      existing = JSON.parse(await readFile(BRIEF_CACHE_PATH, "utf8")) as BriefCachePayload;
    } catch {
      existing = {};
    }
    const briefs = { ...(existing.briefs ?? {}) };
    briefs[brief.locale] = brief;
    await mkdir(path.dirname(BRIEF_CACHE_PATH), { recursive: true });
    await writeFile(
      BRIEF_CACHE_PATH,
      `${JSON.stringify({ briefs }, null, 2)}\n`,
      "utf8",
    );
  } catch {
    // File-system cache is best effort for serverless environments.
  }
}

function briefPrompt(headlines: NewsHeadline[], locale: MorningBriefLocale): string {
  const titles = headlines
    .slice(0, 18)
    .map((headline, index) => `${index + 1}. ${titleText(headline)} (${headline.source})`)
    .join("\n");

  return [
    `Create a concise Sri Lanka morning news brief for locale "${locale}".`,
    "Return JSON only with this shape: {\"bullets\":[\"...\"],\"topics\":[\"politics\"]}.",
    "Use 3-5 bullets. No URLs. Do not invent facts beyond the headlines.",
    "Topic ids should be short English labels such as politics, economy, weather_disaster, sports, other.",
    "Headlines:",
    titles,
  ].join("\n");
}

function parseProviderBrief(
  text: string,
  locale: MorningBriefLocale,
  sourceHeadlineCount: number,
): MorningBrief | null {
  const jsonText = text.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonText) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonText) as {
      bullets?: unknown;
      topics?: unknown;
    };
    const bullets = Array.isArray(parsed.bullets)
      ? parsed.bullets.filter((item): item is string => typeof item === "string")
      : [];
    const topics = Array.isArray(parsed.topics)
      ? parsed.topics.filter((item): item is string => typeof item === "string")
      : [];

    return {
      generatedAt: new Date().toISOString(),
      locale,
      bullets: bullets.map((bullet) => bullet.trim()).filter(Boolean),
      topics: topics.map((topic) => topic.trim()).filter(Boolean),
      sourceHeadlineCount,
      quality: "pass",
      provenancePath: getSourceProvenancePath(NEWS_SOURCE_ID),
    };
  } catch {
    return null;
  }
}

async function fetchAnthropicBrief(
  headlines: NewsHeadline[],
  locale: MorningBriefLocale,
): Promise<MorningBrief | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest",
        max_tokens: 600,
        temperature: 0.2,
        messages: [{ role: "user", content: briefPrompt(headlines, locale) }],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const text = data.content?.find((item) => item.type === "text")?.text;
    return text ? parseProviderBrief(text, locale, headlines.length) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchOpenAiBrief(
  headlines: NewsHeadline[],
  locale: MorningBriefLocale,
): Promise<MorningBrief | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You write concise Sri Lanka morning news briefs as strict JSON.",
          },
          { role: "user", content: briefPrompt(headlines, locale) },
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content;
    return text ? parseProviderBrief(text, locale, headlines.length) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function buildCandidateBrief(
  headlines: NewsHeadline[],
  locale: MorningBriefLocale,
): Promise<MorningBrief> {
  const providerBrief =
    (await fetchAnthropicBrief(headlines, locale)) ??
    (await fetchOpenAiBrief(headlines, locale));

  return providerBrief ?? buildHeuristicBrief(headlines, locale);
}

export async function buildMorningBrief(
  localeInput: string = "en",
): Promise<MorningBrief> {
  const locale = normalizeLocale(localeInput);
  const cached = await readCachedBrief(locale);
  if (cached && cached.quality === "pass" && isFresh(cached.generatedAt)) {
    return cached;
  }

  let headlines: NewsHeadline[] = [];
  try {
    const pulse = await fetchNewsPulse();
    headlines = pulse.headlines;
  } catch {
    return cached ?? minimalBrief(locale);
  }

  const candidate = await buildCandidateBrief(headlines, locale);
  if (!passesQualityGate(candidate, headlines)) {
    return cached ?? minimalBrief(locale);
  }

  await writeCachedBrief(candidate);
  return candidate;
}
