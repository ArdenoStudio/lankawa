import { NextResponse } from "next/server";
import { buildPulseSnapshot } from "@/lib/pulse";
import { getWorldPumpSnapshot } from "@/lib/world-pump";

export async function GET() {
  const pulse = await buildPulseSnapshot();
  const petrol = pulse.metrics.find((metric) => metric.id === "fuel_petrol_92");
  const usd = pulse.metrics.find((metric) => metric.id === "usd_lkr");
  const snapshot = getWorldPumpSnapshot({
    sriLankaPetrolLkr: petrol ? Number(petrol.value) : null,
    usdLkr: usd ? Number(usd.value) : null,
  });

  return NextResponse.json(snapshot);
}
