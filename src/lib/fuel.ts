import {
  fetchOctanePriceHistory,
  type OctaneHistoryPoint,
} from "./integrations/octane";
import { getSourceProvenancePath } from "./sources";

export interface FuelHistorySeries {
  fuelType: string;
  label: string;
  sourceId: string;
  provenancePath: string;
  points: OctaneHistoryPoint[];
}

const FUEL_FALLBACK: Record<string, OctaneHistoryPoint[]> = {
  petrol_92: [
    { recorded_at: "2026-01-06", price_lkr: 294 },
    { recorded_at: "2026-02-01", price_lkr: 292 },
    { recorded_at: "2026-03-01", price_lkr: 293 },
    { recorded_at: "2026-03-22", price_lkr: 398 },
    { recorded_at: "2026-04-01", price_lkr: 398 },
    { recorded_at: "2026-05-31", price_lkr: 434 },
    { recorded_at: "2026-06-30", price_lkr: 414 },
  ],
  auto_diesel: [
    { recorded_at: "2026-01-06", price_lkr: 279 },
    { recorded_at: "2026-02-01", price_lkr: 277 },
    { recorded_at: "2026-03-01", price_lkr: 281 },
    { recorded_at: "2026-03-22", price_lkr: 382 },
    { recorded_at: "2026-04-01", price_lkr: 382 },
    { recorded_at: "2026-05-31", price_lkr: 407 },
    { recorded_at: "2026-06-30", price_lkr: 382 },
  ],
};

async function loadSeries(
  fuelType: string,
  label: string,
  days: number,
): Promise<FuelHistorySeries> {
  try {
    const data = await fetchOctanePriceHistory(fuelType, days);
    const points = data.points.slice(-days);
    return {
      fuelType,
      label,
      sourceId: "octane_fuel",
      provenancePath: getSourceProvenancePath("octane_fuel"),
      points,
    };
  } catch {
    return {
      fuelType,
      label,
      sourceId: "octane_fuel",
      provenancePath: getSourceProvenancePath("octane_fuel"),
      points: FUEL_FALLBACK[fuelType] ?? [],
    };
  }
}

export async function getFuelHistorySeries(days = 90): Promise<FuelHistorySeries[]> {
  const [petrol, diesel] = await Promise.all([
    loadSeries("petrol_92", "Petrol 92", days),
    loadSeries("auto_diesel", "Auto Diesel", days),
  ]);
  return [petrol, diesel];
}
