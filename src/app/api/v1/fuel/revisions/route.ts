import { NextResponse } from "next/server";
import { getFuelRevisionSteps } from "@/lib/fuel";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") ?? "8") || 8, 1),
    40,
  );

  try {
    const steps = await getFuelRevisionSteps(limit);
    return NextResponse.json({
      limit,
      steps,
      sourceId: "octane_fuel",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Fuel revisions unavailable",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status: 502 },
    );
  }
}
