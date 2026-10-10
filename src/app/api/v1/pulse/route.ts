import { NextResponse } from "next/server";
import { buildPulseSnapshot } from "@/lib/pulse";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  const snapshot = await buildPulseSnapshot();
  const buildMs = Date.now() - start;
  const body = JSON.stringify(snapshot);
  const serializeMs = Date.now() - start - buildMs;
  // Explicit Content-Length (no chunked encoding) + observability headers.
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Length": String(Buffer.byteLength(body, "utf8")),
      "x-pulse-build-ms": String(buildMs),
      "x-pulse-serialize-ms": String(serializeMs),
    },
  });
}
