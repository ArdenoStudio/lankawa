import { jsonWithCache } from "@/lib/api-cache";
import { getTransportCatalog, searchTransport } from "@/lib/transport";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get("district") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  const catalog = getTransportCatalog();
  const filtered = searchTransport(q ?? "", district);

  return jsonWithCache(
    {
      sourceId: catalog.sourceId,
      asOf: catalog.asOf,
      count: {
        busRoutes: filtered.routes.length,
        railwayStations: filtered.stations.length,
        airports: filtered.airports.length,
      },
      busRoutes: filtered.routes,
      railwayStations: filtered.stations,
      airports: filtered.airports,
    },
    { request, maxAge: 86400 },
  );
}
