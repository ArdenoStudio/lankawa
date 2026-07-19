import { getFoodData } from "@/lib/integrations/food";
import { jsonWithCache } from "@/lib/api-cache";
import { getSourceProvenancePath } from "@/lib/sources";

export async function GET(request: Request) {
  const snapshot = await getFoodData();

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      ...snapshot,
      provenancePath: getSourceProvenancePath(snapshot.sourceId),
    },
    { maxAge: 86400, staleWhileRevalidate: 604800, request },
  );
}
