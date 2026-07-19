import { jsonWithCache } from "@/lib/api-cache";
import { fetchLandslideSnapshot } from "@/lib/integrations/landslide";

export async function GET(request: Request) {
  const snapshot = await fetchLandslideSnapshot();

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      ...snapshot,
    },
    { maxAge: 1800, staleWhileRevalidate: 7200, request },
  );
}
