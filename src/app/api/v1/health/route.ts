import { NextResponse } from "next/server";
import { buildHealthSnapshot } from "@/lib/pulse";

export const dynamic = "force-dynamic";

export async function GET() {
  const sources = await buildHealthSnapshot();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    sources,
  });
}
