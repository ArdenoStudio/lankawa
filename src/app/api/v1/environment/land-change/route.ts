import { jsonWithCache } from "@/lib/api-cache";
import { getLandChangeSnapshot } from "@/lib/land-change";
import { getSourceProvenancePath } from "@/lib/sources";

export async function GET(request: Request) {
  const snapshot = getLandChangeSnapshot();

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      ...snapshot,
      provenancePath: getSourceProvenancePath(snapshot.sourceId),
    },
    { maxAge: 86400, staleWhileRevalidate: 604800, request },
  );
}
