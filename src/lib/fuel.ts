import {
  fetchOctanePriceChanges,
  fetchOctanePriceHistory,
  type OctaneHistoryPoint,
  type OctanePriceChange,
} from "./integrations/octane";
import { getSourceProvenancePath } from "./sources";

export interface FuelHistorySeries {
  fuelType: string;
  label: string;
  sourceId: string;
  provenancePath: string;
  points: OctaneHistoryPoint[];
}

export interface FuelRevisionStep {
  fuelType: string;
  label: string;
  recordedAt: string;
  priceLkr: number;
  previousLkr: number;
  deltaLkr: number;
  deltaPct: number;
}

const FUEL_LABELS: Record<string, string> = {
  petrol_92: "Petrol 92",
  auto_diesel: "Auto Diesel",
  petrol_95: "Petrol 95",
  super_diesel: "Super Diesel",
  kerosene: "Kerosene",
};

const TRACKED_REVISION_FUELS = new Set(["petrol_92", "auto_diesel"]);

const REVISION_FALLBACK: FuelRevisionStep[] = [
  {
    fuelType: "petrol_92",
    label: "Petrol 92",
    recordedAt: "2026-06-30",
    priceLkr: 414,
    previousLkr: 434,
    deltaLkr: -20,
    deltaPct: -4.61,
  },
  {
    fuelType: "auto_diesel",
    label: "Auto Diesel",
    recordedAt: "2026-06-30",
    priceLkr: 382,
    previousLkr: 407,
    deltaLkr: -25,
    deltaPct: -6.14,
  },
  {
    fuelType: "petrol_92",
    label: "Petrol 92",
    recordedAt: "2026-05-31",
    priceLkr: 434,
    previousLkr: 410,
    deltaLkr: 24,
    deltaPct: 5.85,
  },
  {
    fuelType: "auto_diesel",
    label: "Auto Diesel",
    recordedAt: "2026-05-31",
    priceLkr: 407,
    previousLkr: 392,
    deltaLkr: 15,
    deltaPct: 3.83,
  },
];

function toRevisionStep(change: OctanePriceChange): FuelRevisionStep {
  return {
    fuelType: change.fuel_type,
    label: FUEL_LABELS[change.fuel_type] ?? change.fuel_type,
    recordedAt: change.recorded_at,
    priceLkr: change.price_lkr,
    previousLkr: change.previous_lkr,
    deltaLkr: change.delta_lkr,
    deltaPct: change.delta_pct,
  };
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

export async function getFuelRevisionSteps(
  limit = 8,
): Promise<FuelRevisionStep[]> {
  try {
    const data = await fetchOctanePriceChanges(40);
    const steps = data.changes
      .filter((change) => TRACKED_REVISION_FUELS.has(change.fuel_type))
      .map(toRevisionStep)
      .slice(0, limit);
    return steps.length > 0 ? steps : REVISION_FALLBACK.slice(0, limit);
  } catch {
    return REVISION_FALLBACK.slice(0, limit);
  }
}
