import { NextResponse } from "next/server";
import { getDistrict } from "@/lib/districts";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const district = getDistrict(slug);

  if (!district) {
    return NextResponse.json({ error: "District not found" }, { status: 404 });
  }

  return NextResponse.json(district);
}
