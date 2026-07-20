import { jsonWithCache } from "@/lib/api-cache";
import { fetchCseCompanyQuotes } from "@/lib/integrations/cse";
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
        quotes: [],
        provenancePath: getSourceProvenancePath("cse_lk"),
      },
      { maxAge: 60, staleWhileRevalidate: 300, request },
    );
  }

  const quotes = await fetchCseCompanyQuotes(symbols);

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      quotes,
      provenancePath: getSourceProvenancePath("cse_lk"),
    },
    { maxAge: 120, staleWhileRevalidate: 600, request },
  );
}
