import { fetchNewsPulse, SL_NEWS_FEEDS } from "@/lib/integrations/news";

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

export async function GET() {
  const generatedAt = new Date().toISOString();

  try {
    const pulse = await fetchNewsPulse();
    const updated = pulse.headlines[0]?.publishedAt ?? pulse.fetchedAt;
    const entries = pulse.headlines
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

    return new Response(`<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${SITE_URL}/feed.xml</id>
  <title>Lankawa News Pulse</title>
  <subtitle>Latest Sri Lanka headlines from public RSS feeds</subtitle>
  <link href="${SITE_URL}/" />
  <link rel="self" href="${SITE_URL}/feed.xml" />
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
    return new Response(`<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${SITE_URL}/feed.xml</id>
  <title>Lankawa News Pulse</title>
  <subtitle>Latest Sri Lanka headlines from public RSS feeds</subtitle>
  <link href="${SITE_URL}/" />
  <link rel="self" href="${SITE_URL}/feed.xml" />
  <updated>${escapeXml(generatedAt)}</updated>
  <author>
    <name>Lankawa</name>
  </author>
</feed>
`, {
      status: 503,
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }
}
