import { NextResponse } from "next/server";
import { DISTRICTS } from "@/lib/districts";

export async function GET() {
  return NextResponse.json({
    count: DISTRICTS.length,
    districts: DISTRICTS,
  });
}
