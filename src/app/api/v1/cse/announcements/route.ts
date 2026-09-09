import { jsonWithCache } from "@/lib/api-cache";
import { fetchCseCompanyAnnouncements } from "@/lib/integrations/cse";
import { sanitizeCseWatchlist } from "@/lib/cse-watchlist";
import { getSourceProvenancePath } from "@/lib/sources";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("symbols") ?? "";
  const symbols = sanitizeCseWatchlist(
    raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  );

  if (symbols.length === 0) {
    return jsonWithCache(
      {
        generatedAt: new Date().toISOString(),
        announcements: {},
        provenancePath: getSourceProvenancePath("cse_lk"),
      },
      { maxAge: 60, staleWhileRevalidate: 300, request },
    );
  }

  const results = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        return [symbol, await fetchCseCompanyAnnouncements(symbol)] as const;
      } catch {
        return [symbol, [] as Awaited<ReturnType<typeof fetchCseCompanyAnnouncements>>] as const;
      }
    }),
  );

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      announcements: Object.fromEntries(results),
      provenancePath: getSourceProvenancePath("cse_lk"),
    },
    { maxAge: 900, staleWhileRevalidate: 3600, request },
  );
}
