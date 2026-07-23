import { NextResponse } from "next/server";
import { buildLankaStressIndex } from "@/lib/lanka-stress";

export const dynamic = "force-dynamic";

export async function GET() {
  const index = await buildLankaStressIndex();
  return NextResponse.json(index);
}
