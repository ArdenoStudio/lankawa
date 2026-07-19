import { getFuelHistorySeries } from "@/lib/fuel";
import { jsonWithCache } from "@/lib/api-cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") ?? "90");

  try {
    const series = await getFuelHistorySeries(days);
    return jsonWithCache(
      {
        generatedAt: new Date().toISOString(),
        days,
        series,
        sourceId: "octane_fuel",
        provenancePath: "/sources/octane_fuel",
      },
      { maxAge: 3600, staleWhileRevalidate: 86400, request },
    );
  } catch {
    return jsonWithCache(
      { series: [], sourceId: "octane_fuel", provenancePath: "/sources/octane_fuel" },
      { maxAge: 300, request },
    );
  }
}
