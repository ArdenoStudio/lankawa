import { NextResponse } from "next/server";
import { buildPulseSnapshot } from "@/lib/pulse";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await buildPulseSnapshot();
  return NextResponse.json(snapshot);
}
