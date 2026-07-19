import { getLifeOverview } from "@/lib/integrations/life";
import { jsonWithCache } from "@/lib/api-cache";
import { getSourceProvenancePath } from "@/lib/sources";

export async function GET(request: Request) {
  const snapshot = await getLifeOverview();

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      ...snapshot,
      provenancePath: getSourceProvenancePath(snapshot.sourceId),
    },
    { maxAge: 3600, staleWhileRevalidate: 86400, request },
  );
}
