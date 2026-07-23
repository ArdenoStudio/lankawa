export const WIKIPEDIA_LK_SOURCE_ID = "wikipedia_lk" as const;

const SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";
const USER_AGENT = "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)";
const FETCH_TIMEOUT_MS = 8_000;

export type WikipediaSummary = {
  title: string;
  extract: string;
  url: string;
};

type WikipediaRestSummary = {
  title?: string;
  extract?: string;
  content_urls?: {
    desktop?: { page?: string };
  };
  type?: string;
};

function buildTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal === "undefined" || !("timeout" in AbortSignal)) {
    return undefined;
  }
  return (
    AbortSignal as typeof AbortSignal & { timeout(ms: number): AbortSignal }
  ).timeout(timeoutMs);
}

/** Map a Lankawa district slug to an English Wikipedia article title. */
export function wikipediaTitleForDistrictSlug(slug: string): string | null {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  const name = normalized
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  if (!name) {
    return null;
  }
  return `${name} District`;
}

export function parseWikipediaSummary(
  payload: WikipediaRestSummary | null | undefined,
): WikipediaSummary | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  if (payload.type === "disambiguation") {
    return null;
  }
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const extract =
    typeof payload.extract === "string" ? payload.extract.trim() : "";
  const url =
    typeof payload.content_urls?.desktop?.page === "string"
      ? payload.content_urls.desktop.page.trim()
      : "";
  if (!title || !extract || !url) {
    return null;
  }
  return { title, extract, url };
}

/** First sentence of an extract, without inventing content. */
export function firstSentenceFromExtract(extract: string): string | null {
  const cleaned = extract.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return null;
  }
  const match = cleaned.match(/^(.+?[.!?])(?:\s|$)/);
  const sentence = (match?.[1] ?? cleaned).trim();
  if (!sentence || sentence.length < 12) {
    return null;
  }
  // Cap long run-ons without a terminator.
  if (sentence.length > 280) {
    return `${sentence.slice(0, 277).trimEnd()}…`;
  }
  return sentence;
}

export async function fetchWikipediaSummary(
  title: string,
): Promise<WikipediaSummary | null> {
  const trimmed = title.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const encoded = encodeURIComponent(trimmed.replace(/ /g, "_"));
    const response = await fetch(`${SUMMARY_URL}/${encoded}`, {
      signal: buildTimeoutSignal(FETCH_TIMEOUT_MS),
      next: { revalidate: 86400 },
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
    });
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as WikipediaRestSummary;
    return parseWikipediaSummary(payload);
  } catch {
    return null;
  }
}

export async function fetchDistrictWikipediaSummary(
  districtSlug: string,
): Promise<WikipediaSummary | null> {
  const title = wikipediaTitleForDistrictSlug(districtSlug);
  if (!title) {
    return null;
  }
  return fetchWikipediaSummary(title);
}
