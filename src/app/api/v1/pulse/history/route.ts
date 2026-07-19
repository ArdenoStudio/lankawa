import { NextResponse } from "next/server";
import { getPulseHistory, isDatabaseConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error: "Database not configured",
        hint: "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
      },
      { status: 503 },
    );
  }

  try {
    const history = await getPulseHistory(30);
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      days: 30,
      count: history.length,
      snapshots: history,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load history",
      },
      { status: 500 },
    );
  }
}
