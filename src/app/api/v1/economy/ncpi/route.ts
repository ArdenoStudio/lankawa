import { jsonWithCache } from "@/lib/api-cache";
import { getInflationSnapshot } from "@/lib/ncpi";
import { getSourceProvenancePath } from "@/lib/sources";

export async function GET(request: Request) {
  const snapshot = await getInflationSnapshot();

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      ...snapshot,
      provenancePath: getSourceProvenancePath(snapshot.sourceId),
    },
    { maxAge: 21_600, staleWhileRevalidate: 86_400, request },
  );
}
