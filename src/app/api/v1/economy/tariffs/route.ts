import { jsonWithCache } from "@/lib/api-cache";
import { getPucslTariffSnapshot } from "@/lib/pucsl";
import { getSourceProvenancePath } from "@/lib/sources";

export async function GET(request: Request) {
  const snapshot = getPucslTariffSnapshot();

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      ...snapshot,
      provenancePath: getSourceProvenancePath(snapshot.sourceId),
    },
    { maxAge: 86400, staleWhileRevalidate: 604800, request },
  );
}
