import { NextResponse } from "next/server";
import { isDatabaseConfigured, isDatabaseConnected } from "@/lib/db";
import { buildHealthSnapshot } from "@/lib/pulse";
import { packageJsonVersion } from "@/lib/version";

export const dynamic = "force-dynamic";

export async function GET() {
  const generatedAt = new Date().toISOString();
  const dbConfigured = isDatabaseConfigured();
  let dbConnected = false;

  if (dbConfigured) {
    dbConnected = await isDatabaseConnected();
  }

  const sources = await buildHealthSnapshot();
  const tierCounts = sources.reduce(
    (acc, source) => {
      acc[source.tier] = (acc[source.tier] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const freshCount = tierCounts.fresh ?? 0;
  const staleCount = tierCounts.stale ?? 0;
  const downCount = tierCounts.down ?? 0;
  const unknownCount = tierCounts.unknown ?? 0;

  const sourcesHealthy = downCount === 0 && unknownCount === 0;

  return NextResponse.json({
    version: packageJsonVersion,
    generatedAt,
    status: dbConfigured && !dbConnected ? "degraded" : "ok",
    database: {
      configured: dbConfigured,
      connected: dbConnected,
    },
    sources: {
      total: sources.length,
      fresh: freshCount,
      stale: staleCount,
      down: downCount,
      unknown: unknownCount,
      allFresh: sourcesHealthy,
    },
    ingest: {
      cronPath: "/api/cron/ingest",
      schedule: "0 6 * * *",
    },
  });
}
