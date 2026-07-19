import { NextRequest, NextResponse } from "next/server";
import {
  isDatabaseConfigured,
  recordIngestRun,
  reportSourceHealth,
  upsertObservations,
} from "@/lib/db";
import { getEconomyMacroSnapshot } from "@/lib/economy";
import { fetchCbslFxRates, fetchCbslGoldRates } from "@/lib/integrations/cbsl";
import { buildCseSnapshot } from "@/lib/integrations/cse";
import { fetchNewsPulse } from "@/lib/integrations/news";
import { fetchPowerStatus } from "@/lib/integrations/power";
import { fetchColomboWeather } from "@/lib/integrations/weather";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ObservationRow = {
  source_id: string;
  metric: string;
  value: number;
  unit: string | null;
  observed_at: string;
  meta?: Record<string, unknown>;
};

type SourceRun = {
  sourceId: string;
  ok: boolean;
  count: number;
  latencyMs: number;
  error: string | null;
  rows: ObservationRow[];
};

const POWER_STATUS_VALUE: Record<string, number> = {
  normal: 0,
  scheduled: 1,
  outage: 2,
  unknown: 3,
};

async function runSource(
  sourceId: string,
  fn: () => Promise<ObservationRow[]>,
): Promise<SourceRun> {
  const startedMs = Date.now();
  try {
    const rows = await fn();
    return {
      sourceId,
      ok: true,
      count: rows.length,
      latencyMs: Date.now() - startedMs,
      error: null,
      rows,
    };
  } catch (caught) {
    return {
      sourceId,
      ok: false,
      count: 0,
      latencyMs: Date.now() - startedMs,
      error: caught instanceof Error ? caught.message : "Unknown error",
      rows: [],
    };
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();

  const runs = await Promise.all([
    runSource("cbsl_fx", async () => {
      const rates = await fetchCbslFxRates();
      return rates.flatMap((rate) => [
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
    }),
    runSource("cbsl_gold", async () => {
      const rates = await fetchCbslGoldRates();
      if (!rates) {
        throw new Error("CBSL gold rates unavailable");
      }

      return rates.map((rate) => ({
        source_id: "cbsl_gold",
        metric: "gold_lkr_troy_ounce",
        value: rate.priceLkr,
        unit: "LKR",
        observed_at: rate.observedAt,
        meta: {
          date: rate.date,
          unit: rate.unit,
        },
      }));
    }),
    runSource("open_meteo", async () => {
      const weather = await fetchColomboWeather();
      return [
        {
          source_id: "open_meteo",
          metric: "weather_colombo_temp",
          value: weather.temp,
          unit: "C",
          observed_at: weather.observedAt,
          meta: {
            label: weather.label,
            precipitation: weather.precipitation,
          },
        },
      ];
    }),
    runSource("cse_lk", async () => {
      const snapshot = await buildCseSnapshot();
      if (snapshot.isFallback) {
        throw new Error("CSE returned seed fallback — not persisting");
      }
      return [
        {
          source_id: "cse_lk",
          metric: "cse_aspi",
          value: snapshot.aspi.value,
          unit: "index",
          observed_at: snapshot.asOf,
          meta: {
            changePct: snapshot.aspi.changePct,
            marketStatus: snapshot.marketStatus,
          },
        },
      ];
    }),
    runSource("news_rss", async () => {
      const pulse = await fetchNewsPulse();
      const observedAt = pulse.fetchedAt ?? new Date().toISOString();
      return [
        {
          source_id: "news_rss",
          metric: "headline_count",
          value: pulse.headlines.length,
          unit: "count",
          observed_at: observedAt,
          meta: {
            titles: pulse.headlines.slice(0, 5).map((item) => item.title),
          },
        },
      ];
    }),
    runSource("ceb_power", async () => {
      const power = await fetchPowerStatus();
      if (power.status === "unknown") {
        throw new Error(power.summary || "CEB power status unknown");
      }
      return [
        {
          source_id: "ceb_power",
          metric: "power_status",
          value: POWER_STATUS_VALUE[power.status] ?? 3,
          unit: "enum",
          observed_at: power.observedAt,
          meta: {
            status: power.status,
            summary: power.summary,
            affectedAreas: power.affectedAreas.slice(0, 12),
          },
        },
      ];
    }),
    runSource("cbsl_macro", async () => {
      const macro = getEconomyMacroSnapshot();
      const observedAt = `${macro.asOf}T00:00:00.000Z`;
      return macro.indicators.map((indicator) => ({
        source_id: "cbsl_macro",
        metric: indicator.id,
        value: indicator.value,
        unit: indicator.unit,
        observed_at: observedAt,
        meta: {
          label: indicator.label,
          period: indicator.period,
        },
      }));
    }),
  ]);

  const finishedAt = new Date().toISOString();
  const allRows = runs.flatMap((run) => run.rows);

  if (isDatabaseConfigured() && allRows.length > 0) {
    await upsertObservations(allRows).catch(() => undefined);
  }

  if (isDatabaseConfigured()) {
    await Promise.all(
      runs.map(async (run) => {
        await reportSourceHealth({
          source_id: run.sourceId,
          ok: run.ok,
          latency_ms: run.latencyMs,
          observations_count: run.count,
          error: run.error,
          consecutive_failures: run.ok ? 0 : 1,
        }).catch(() => undefined);

        await recordIngestRun({
          sourceId: run.sourceId,
          startedAt,
          finishedAt,
          ok: run.ok,
          observationsCount: run.count,
          latencyMs: run.latencyMs,
          error: run.error,
          triggerSource: "vercel_cron",
        }).catch(() => undefined);
      }),
    );
  }

  const failed = runs.filter((run) => !run.ok);
  const payload = {
    ok: failed.length === 0,
    startedAt,
    finishedAt,
    persisted: isDatabaseConfigured(),
    sources: runs.map(({ sourceId, ok, count, latencyMs, error }) => ({
      sourceId,
      ok,
      observations: count,
      latencyMs,
      error,
    })),
  };

  return NextResponse.json(payload, {
    status: failed.length === runs.length ? 500 : 200,
  });
}
