import { NextResponse } from "next/server";
import { jsonWithCache } from "@/lib/api-cache";
import {
  formatApproxPlace,
  NOMINATIM_OSM_SOURCE_ID,
  reverseGeocode,
} from "@/lib/integrations/nominatim";
import { getSourceProvenancePath } from "@/lib/sources";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number.parseFloat(searchParams.get("lat") ?? "");
  const lon = Number.parseFloat(searchParams.get("lon") ?? "");

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      {
        error: "lat and lon query params are required numbers",
        approx: null,
        place: null,
        provenancePath: getSourceProvenancePath(NOMINATIM_OSM_SOURCE_ID),
      },
      { status: 400 },
    );
  }

  // Hard 10/min limit applied in middleware via the `geocode` rate bucket.
  const place = await reverseGeocode(lat, lon);
  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      lat,
      lon,
      approx: formatApproxPlace(lat, lon),
      place: place
        ? {
            displayName: place.displayName,
            lat: place.lat,
            lon: place.lon,
          }
        : null,
      sourceId: NOMINATIM_OSM_SOURCE_ID,
      provenancePath: getSourceProvenancePath(NOMINATIM_OSM_SOURCE_ID),
    },
    {
      maxAge: 86400,
      staleWhileRevalidate: 604800,
      request,
    },
  );
}
