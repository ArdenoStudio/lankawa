import { getLatestFxRate } from "./economy";
import { getFuelRevisionSteps } from "./fuel";

/**
 * Cross-vertical "ripples": plain-language chains showing how a change in
 * one domain (fuel, FX) flows into household costs. All figures are
 * estimates from live Lankawa data, with assumptions stated on the page.
 */

export interface FuelRipple {
  kind: "fuel";
  fuelLabel: string;
  priceLkr: number;
  deltaLkr: number;
  deltaPct: number;
  recordedAt: string;
  /** Estimated monthly cost change for a typical motorbike commuter. */
  monthlyImpactLkr: number;
  direction: "up" | "down" | "flat";
}

export interface FxRipple {
  kind: "fx";
  sellRate: number;
  buyRate: number | null;
  observedAt: string | null;
  direction: "up" | "down" | "flat";
}

// Heuristic commuter profile used for the household-cost estimate:
// 40 km/day, 22 working days/month, motorbike at ~40 km/L.
const COMMUTER_KM_PER_MONTH = 40 * 22;
const BIKE_KM_PER_LITRE = 40;

export async function getFuelRipple(): Promise<FuelRipple | null> {
  try {
    const steps = await getFuelRevisionSteps(8);
    const step = steps.find((s) => s.fuelType === "petrol_92") ?? steps[0];
    if (!step) return null;
    const litresPerMonth = COMMUTER_KM_PER_MONTH / BIKE_KM_PER_LITRE;
    const monthlyImpactLkr = step.deltaLkr * litresPerMonth;
    const direction =
      step.deltaLkr > 0 ? "up" : step.deltaLkr < 0 ? "down" : "flat";
    return {
      kind: "fuel",
      fuelLabel: step.label,
      priceLkr: step.priceLkr,
      deltaLkr: step.deltaLkr,
      deltaPct: step.deltaPct,
      recordedAt: step.recordedAt,
      monthlyImpactLkr,
      direction,
    };
  } catch {
    return null;
  }
}

export async function getFxRipple(): Promise<FxRipple | null> {
  try {
    const fx = await getLatestFxRate();
    if (!fx || !fx.sellRate) return null;
    return {
      kind: "fx",
      sellRate: fx.sellRate,
      buyRate: fx.buyRate ?? null,
      observedAt: fx.observedAt ?? null,
      direction: "flat",
    };
  } catch {
    return null;
  }
}

export type Ripple = FuelRipple | FxRipple;

export async function getRipples(): Promise<Ripple[]> {
  const [fuel, fx] = await Promise.all([getFuelRipple(), getFxRipple()]);
  const ripples: Ripple[] = [];
  if (fuel) ripples.push(fuel);
  if (fx) ripples.push(fx);
  return ripples;
}
