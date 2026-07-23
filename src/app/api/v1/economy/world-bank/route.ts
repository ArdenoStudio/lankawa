import { jsonWithCache } from "@/lib/api-cache";
import { fetchWorldBankLkaSnapshot } from "@/lib/integrations/world-bank";
import { getSourceProvenancePath } from "@/lib/sources";

export async function GET(request: Request) {
  const snapshot = await fetchWorldBankLkaSnapshot();

  if (!snapshot) {
    return jsonWithCache(
      {
        generatedAt: new Date().toISOString(),
        snapshot: null,
        provenancePath: getSourceProvenancePath("world_bank_lka"),
      },
      { maxAge: 86400, staleWhileRevalidate: 604800, request },
    );
  }

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      ...snapshot,
      provenancePath: getSourceProvenancePath(snapshot.sourceId),
    },
    { maxAge: 86400, staleWhileRevalidate: 604800, request },
  );
}
