/**
 * GET /api/v1/nic?nic=851234567V
 *
 * Sri Lanka NIC decoder API. Returns parsed birthdate, gender,
 * age, and voting eligibility from a legacy or new NIC number.
 *
 * Query params:
 *   ?nic=<NIC>   — Required. The NIC to decode.
 *
 * Response 200: NicDecodeResult JSON
 * Response 400: { error: "...", errors: string[] }
 */

import { NextResponse } from "next/server";
import { decodeNIC } from "@/lib/nic-decoder";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nic = searchParams.get("nic");

  if (!nic) {
    return NextResponse.json(
      { error: "Missing required query parameter: nic" },
      { status: 400 },
    );
  }

  const result = decodeNIC(nic);

  if (!result.valid) {
    return NextResponse.json(
      {
        error: "Invalid NIC",
        errors: result.errors,
        raw: result.raw,
        format: result.format,
      },
      { status: 400 },
    );
  }

  return NextResponse.json(result, {
    headers: {
      // NIC data is deterministic — long cache is fine
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}
