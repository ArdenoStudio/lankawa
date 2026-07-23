import { NextResponse } from "next/server";
import { jsonWithCache } from "@/lib/api-cache";
import {
  getHolidaySnapshot,
  LK_PUBLIC_HOLIDAYS_SOURCE_ID,
} from "@/lib/integrations/holidays";
import { getSourceProvenancePath } from "@/lib/sources";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const year =
    yearParam != null && yearParam.trim() !== ""
      ? Number.parseInt(yearParam, 10)
      : undefined;

  if (year != null && (!Number.isFinite(year) || year < 1900 || year > 2100)) {
    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        error: "Invalid year",
        snapshot: null,
        provenancePath: getSourceProvenancePath(LK_PUBLIC_HOLIDAYS_SOURCE_ID),
      },
      { status: 400 },
    );
  }

  const snapshot = getHolidaySnapshot(year);

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      snapshot,
      provenancePath: getSourceProvenancePath(LK_PUBLIC_HOLIDAYS_SOURCE_ID),
    },
    { maxAge: 86400, staleWhileRevalidate: 604800, request },
  );
}
