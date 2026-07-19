import { NextRequest, NextResponse } from "next/server";
import {
  isDatabaseConfigured,
  recordIngestRun,
  reportSourceHealth,
  upsertObservations,
} from "@/lib/db";
import { fetchCbslFxRates } from "@/lib/integrations/cbsl";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  let error: string | null = null;
  let count = 0;

  try {
    const rates = await fetchCbslFxRates();
    const rows = rates.flatMap((rate) => [
      {
        source_id: "cbsl_fx",
        metric: "usd_lkr_buy",
        value: rate.buyRate,
        unit: "LKR",
        observed_at: rate.observedAt,
      },
      {
        source_id: "cbsl_fx",
        metric: "usd_lkr_sell",
        value: rate.sellRate,
        unit: "LKR",
        observed_at: rate.observedAt,
      },
    ]);

    if (isDatabaseConfigured()) {
      await upsertObservations(rows);
    }
    count = rows.length;
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unknown error";
  }

  const latencyMs = Date.now() - startedMs;
  const finishedAt = new Date().toISOString();

  if (isDatabaseConfigured()) {
    await reportSourceHealth({
      source_id: "cbsl_fx",
      ok: error == null,
      latency_ms: latencyMs,
      observations_count: count,
      error,
      consecutive_failures: error ? 1 : 0,
    }).catch(() => undefined);

    await recordIngestRun({
      sourceId: "cbsl_fx",
      startedAt,
      finishedAt,
      ok: error == null,
      observationsCount: count,
      latencyMs,
      error,
      triggerSource: "vercel_cron",
    }).catch(() => undefined);
  }

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    observations: count,
    persisted: isDatabaseConfigured(),
    latencyMs,
  });
}
