import { getDengueSnapshot } from "@/lib/health";
import { jsonWithCache } from "@/lib/api-cache";

export async function GET(request: Request) {
  const snapshot = getDengueSnapshot();
  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      ...snapshot,
      provenancePath: `/sources/${snapshot.sourceId}`,
    },
    { maxAge: 86400, staleWhileRevalidate: 604800, request },
  );
}
