import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { fetchCbslFxRates } from "@/lib/integrations/cbsl";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function upsertObservations(
  rows: Array<{
    source_id: string;
    metric: string;
    value: number;
    unit: string;
    observed_at: string;
  }>,
): Promise<void> {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? null;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;

  if (!url || !key) {
    throw new Error("Database not configured");
  }

  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/observations`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    throw new Error(`Observation upsert failed (${response.status})`);
  }
}

async function reportHealth(payload: {
  source_id: string;
  ok: boolean;
  latency_ms: number;
  observations_count: number;
  error: string | null;
  consecutive_failures: number;
}): Promise<void> {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? null;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;

  if (!url || !key) {
    return;
  }

  await fetch(`${url.replace(/\/$/, "")}/rest/v1/source_health`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const started = Date.now();
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

  const latencyMs = Date.now() - started;
  await reportHealth({
    source_id: "cbsl_fx",
    ok: error == null,
    latency_ms: latencyMs,
    observations_count: count,
    error,
    consecutive_failures: error ? 1 : 0,
  });

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
