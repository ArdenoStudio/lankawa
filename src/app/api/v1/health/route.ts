import { NextResponse } from "next/server";
import { buildCatalogHealthSnapshot } from "@/lib/catalog-health";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const sources = await buildCatalogHealthSnapshot();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    sources,
  });
}
