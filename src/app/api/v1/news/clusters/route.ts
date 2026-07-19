import { NextResponse } from "next/server";
import { fetchNewsPulse } from "@/lib/integrations/news";
import { clusterHeadlines } from "@/lib/integrations/news-cluster";

export async function GET() {
  try {
    const pulse = await fetchNewsPulse();
    const clusters = clusterHeadlines(pulse.headlines, 0.35)
      .filter((cluster) => cluster.headlines.length >= 2)
      .slice(0, 8)
      .map((cluster) => ({
        topic: cluster.topic,
        score: cluster.score,
        outletCount: new Set(cluster.headlines.map((item) => item.source)).size,
        headlines: cluster.headlines.slice(0, 5).map((headline) => ({
          title: headline.title,
          source: headline.source,
          url: headline.url,
          publishedAt: headline.publishedAt,
        })),
      }));

    return NextResponse.json({
      asOf: new Date().toISOString(),
      clusterCount: clusters.length,
      clusters,
      provenancePath: pulse.provenancePath,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "News clusters unavailable",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status: 502 },
    );
  }
}
