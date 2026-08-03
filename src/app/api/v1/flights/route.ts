/**
 * GET /api/v1/flights
 *
 * CMB airport live flight schedule via Aviation Edge.
 * Falls back to seed when API key is absent or upstream fails.
 *
 * Query params:
 *   ?airline=UL    — filter to SriLankan Airlines only
 *   ?direction=arrival|departure  — filter by direction
 */

import { NextResponse } from "next/server";
import { getCMBFlights, getSriLankanFlights } from "@/lib/integrations/aviation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const airline = searchParams.get("airline")?.toUpperCase();
  const direction = searchParams.get("direction")?.toLowerCase();

  try {
    const result =
      airline === "UL" ? await getSriLankanFlights() : await getCMBFlights();

    let arrivals = result.arrivals;
    let departures = result.departures;

    if (direction === "arrival") {
      departures = [];
    } else if (direction === "departure") {
      arrivals = [];
    }

    return NextResponse.json(
      {
        sourceId: result.sourceId,
        asOf: result.asOf,
        isFallback: result.isFallback,
        disclaimer: result.disclaimer,
        summary: {
          totalArrivals: arrivals.length,
          totalDepartures: departures.length,
          delayedCount: result.delayedCount,
          cancelledCount: result.cancelledCount,
        },
        arrivals,
        departures,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch flight data", detail: String(err) },
      { status: 500 },
    );
  }
}
