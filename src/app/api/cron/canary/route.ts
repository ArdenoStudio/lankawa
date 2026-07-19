import { NextRequest, NextResponse } from "next/server";
import { buildHealthSnapshot } from "@/lib/pulse";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CRITICAL_SOURCE_IDS = [
  "cbsl_fx",
  "octane_fuel",
  "lk_flood_api",
  "open_meteo",
  "ceb_power",
  "cse_lk",
] as const;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sources = await buildHealthSnapshot();
  const critical = sources.filter((source) =>
    (CRITICAL_SOURCE_IDS as readonly string[]).includes(source.id),
  );
  const down = critical.filter((source) => source.tier === "down");

  return NextResponse.json({
    ok: down.length === 0,
    checkedAt: new Date().toISOString(),
    criticalSourceIds: CRITICAL_SOURCE_IDS,
    downSourceIds: down.map((source) => source.id),
    sources,
  });
}
