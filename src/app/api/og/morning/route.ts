import { pickMorningOgMetrics, renderMorningOgSvg } from "@/lib/morning-og";
import { buildPulseSnapshot } from "@/lib/pulse";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  const snapshot = await buildPulseSnapshot();
  const metrics = pickMorningOgMetrics(snapshot, 4);
  const svg = renderMorningOgSvg({
    title: "Lankawa morning",
    asOf: `As of ${new Date(snapshot.generatedAt).toISOString().slice(0, 16)}Z`,
    metrics,
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
