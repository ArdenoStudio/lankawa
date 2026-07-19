import { jsonWithCache } from "@/lib/api-cache";
import { getEnvironmentData } from "@/lib/environment";
import { getSourceProvenancePath } from "@/lib/sources";

export async function GET(request: Request) {
  const snapshot = await getEnvironmentData();

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      ...snapshot,
      provenancePath: getSourceProvenancePath(snapshot.sourceId),
    },
    { maxAge: 3600, staleWhileRevalidate: 86400, request },
  );
}
