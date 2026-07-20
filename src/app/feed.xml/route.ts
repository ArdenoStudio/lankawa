import { fetchNewsPulse, SL_NEWS_FEEDS } from "@/lib/integrations/news";
import { filterHeadlinesSince, parseSinceParam } from "@/lib/atom-since";

const SITE_URL = "https://lankawa.vercel.app";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sourceName(sourceId: string): string {
  return SL_NEWS_FEEDS.find((feed) => feed.id === sourceId)?.name ?? sourceId;
}

function emptyFeed(generatedAt: string, sinceLabel: string | null, status = 200) {
  const subtitle = sinceLabel
    ? `Delta since ${sinceLabel} — Sri Lanka headlines from public RSS feeds`
    : "Latest Sri Lanka headlines from public RSS feeds";

  return new Response(`<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${SITE_URL}/feed.xml</id>
  <title>Lankawa News Pulse</title>
  <subtitle>${escapeXml(subtitle)}</subtitle>
  <link href="${SITE_URL}/" />
  <link rel="self" href="${SITE_URL}/feed.xml${sinceLabel ? `?since=${escapeXml(sinceLabel)}` : ""}" />
  <updated>${escapeXml(generatedAt)}</updated>
  <author>
    <name>Lankawa</name>
  </author>
</feed>
`, {
    status,
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control":
        status === 503
          ? "public, max-age=300"
          : "public, max-age=900, stale-while-revalidate=3600",
    },
  });
}

export async function GET(request: Request) {
  const generatedAt = new Date().toISOString();
  const sinceRaw = new URL(request.url).searchParams.get("since");
  const sinceMs = parseSinceParam(sinceRaw);

  try {
    const pulse = await fetchNewsPulse();
    const headlines = filterHeadlinesSince(pulse.headlines, sinceMs);
    const updated =
      headlines[0]?.publishedAt ?? pulse.headlines[0]?.publishedAt ?? pulse.fetchedAt;
    const entries = headlines
      .map((headline) => {
        const publishedAt = headline.publishedAt || pulse.fetchedAt;

        return `<entry>
  <id>${escapeXml(headline.url)}</id>
  <title>${escapeXml(headline.title)}</title>
  <link href="${escapeXml(headline.url)}" />
  <updated>${escapeXml(publishedAt)}</updated>
  <published>${escapeXml(publishedAt)}</published>
  <summary>${escapeXml(sourceName(headline.source))}</summary>
</entry>`;
      })
      .join("\n");

    const selfHref = sinceRaw
      ? `${SITE_URL}/feed.xml?since=${encodeURIComponent(sinceRaw)}`
      : `${SITE_URL}/feed.xml`;
    const subtitle = sinceRaw
      ? `Delta since ${sinceRaw} — Sri Lanka headlines from public RSS feeds`
      : "Latest Sri Lanka headlines from public RSS feeds";

    return new Response(`<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${SITE_URL}/feed.xml</id>
  <title>Lankawa News Pulse</title>
  <subtitle>${escapeXml(subtitle)}</subtitle>
  <link href="${SITE_URL}/" />
  <link rel="self" href="${escapeXml(selfHref)}" />
  <updated>${escapeXml(updated)}</updated>
  <author>
    <name>Lankawa</name>
  </author>
${entries}
</feed>
`, {
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
        "Cache-Control": "public, max-age=900, stale-while-revalidate=3600",
      },
    });
  } catch {
    return emptyFeed(generatedAt, sinceRaw, 503);
  }
}
