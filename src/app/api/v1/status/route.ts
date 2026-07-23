import { NextResponse } from "next/server";
import { buildCatalogHealthSnapshot } from "@/lib/catalog-health";
import { isDatabaseConfigured, isDatabaseConnected } from "@/lib/db";
import { packageJsonVersion } from "@/lib/version";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const generatedAt = new Date().toISOString();
  const dbConfigured = isDatabaseConfigured();
  let dbConnected = false;

  if (dbConfigured) {
    dbConnected = await isDatabaseConnected();
  }

  const sources = await buildCatalogHealthSnapshot();
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
  const status =
    (dbConfigured && !dbConnected) || downCount > 0 ? "degraded" : "ok";

  return NextResponse.json({
    version: packageJsonVersion,
    generatedAt,
    status,
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
      rows: sources.map((source) => ({
        id: source.id,
        tier: source.tier,
        lastCheckedAt: source.lastCheckedAt,
        lastSuccessAt: source.lastSuccessAt,
        error: source.error,
      })),
    },
    ingest: {
      cronPath: "/api/cron/ingest",
      schedule: "0 6 * * *",
    },
  });
}
