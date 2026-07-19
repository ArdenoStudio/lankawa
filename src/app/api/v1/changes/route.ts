import changes from "@/data/changes.json";
import { jsonWithCache } from "@/lib/api-cache";

export async function GET(request: Request) {
  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      note: changes.generatedNote,
      count: changes.entries.length,
      entries: changes.entries,
    },
    { maxAge: 3600, staleWhileRevalidate: 86400, request },
  );
}
