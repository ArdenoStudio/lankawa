import { NextResponse } from "next/server";
import { buildPulseSnapshot } from "@/lib/pulse";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  const snapshot = await buildPulseSnapshot();
  const buildMs = Date.now() - start;
  const res = NextResponse.json(snapshot);
  // Observability: how long the function actually spent building the snapshot.
  // If this is small while the client-observed total is large, the delay is
  // in response delivery (runtime/proxy), not in data gathering.
  res.headers.set("x-pulse-build-ms", String(buildMs));
  return res;
}
