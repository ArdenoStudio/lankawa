import { jsonWithCache } from "@/lib/api-cache";
import { getSourceProvenancePath } from "@/lib/sources";
import { filterTenderNotices, getTendersData } from "@/lib/tenders";
import type { TenderStatus } from "@/lib/types";

const TENDER_STATUSES = new Set<TenderStatus>(["open", "closing_soon", "closed"]);

function tenderStatusFromQuery(value: string | null): TenderStatus | undefined {
  return value && TENDER_STATUSES.has(value as TenderStatus)
    ? (value as TenderStatus)
    : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const snapshot = await getTendersData();
  const notices = filterTenderNotices(snapshot.notices, {
    q: searchParams.get("q") ?? undefined,
    district: searchParams.get("district") ?? undefined,
    province: searchParams.get("province") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    status: tenderStatusFromQuery(searchParams.get("status")),
  });

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      sourceId: snapshot.sourceId,
      sourceName: snapshot.sourceName,
      asOf: snapshot.asOf,
      count: notices.length,
      notices,
      provenancePath: getSourceProvenancePath(snapshot.sourceId),
    },
    { maxAge: 3600, staleWhileRevalidate: 86400, request },
  );
}
