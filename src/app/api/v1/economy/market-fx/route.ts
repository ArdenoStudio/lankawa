import { jsonWithCache } from "@/lib/api-cache";
import { fetchMarketFxSnapshot } from "@/lib/integrations/market-fx";
import { getSourceProvenancePath } from "@/lib/sources";

export async function GET(request: Request) {
  const snapshot = await fetchMarketFxSnapshot();

  if (!snapshot) {
    return jsonWithCache(
      {
        generatedAt: new Date().toISOString(),
        snapshot: null,
        provenancePath: getSourceProvenancePath("market_fx_fawaz"),
      },
      { maxAge: 3600, staleWhileRevalidate: 86400, request },
    );
  }

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      ...snapshot,
      provenancePath: getSourceProvenancePath(snapshot.sourceId),
    },
    { maxAge: 3600, staleWhileRevalidate: 86400, request },
  );
}
