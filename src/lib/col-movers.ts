import { getFoodData, getFoodSnapshot } from "@/lib/food";
import { getFuelHistorySeries } from "@/lib/fuel";

export type ColMoverHonesty = "live" | "seed";

export interface ColBasketMover {
  id: string;
  label: string;
  category: "fuel" | "food";
  unit: string;
  previousLkr: number;
  currentLkr: number;
  deltaLkr: number;
  deltaPct: number;
  asOf: string;
  honesty: ColMoverHonesty;
}

/** Prior staple reference for week-over-week illustration when live history is absent. */
const PREVIOUS_STAPLE_PRICES: Record<string, number> = {
  rice: 310,
  dhal: 405,
  "big-onion": 275,
  coconut: 135,
  chicken: 1620,
  eggs: 600,
  "milk-powder": 870,
  bread: 175,
};

function toMover(input: {
  id: string;
  label: string;
  category: "fuel" | "food";
  unit: string;
  previousLkr: number;
  currentLkr: number;
  asOf: string;
  honesty: ColMoverHonesty;
}): ColBasketMover | null {
  const deltaLkr = input.currentLkr - input.previousLkr;
  if (!Number.isFinite(deltaLkr) || deltaLkr === 0) {
    return null;
  }
  const deltaPct =
    input.previousLkr !== 0 ? (deltaLkr / input.previousLkr) * 100 : 0;

  return {
    ...input,
    deltaLkr: Number(deltaLkr.toFixed(2)),
    deltaPct: Number(deltaPct.toFixed(2)),
  };
}

export async function getColBasketMovers(limit = 8): Promise<ColBasketMover[]> {
  const movers: ColBasketMover[] = [];

  const fuelSeries = await getFuelHistorySeries(90);
  for (const series of fuelSeries) {
    if (series.points.length < 2) {
      continue;
    }
    const previous = series.points[series.points.length - 2];
    const current = series.points[series.points.length - 1];
    const mover = toMover({
      id: `fuel_${series.fuelType}`,
      label: series.label,
      category: "fuel",
      unit: "LKR/L",
      previousLkr: previous.price_lkr,
      currentLkr: current.price_lkr,
      asOf: current.recorded_at,
      honesty: "live",
    });
    if (mover) {
      movers.push(mover);
    }
  }

  const seedFood = getFoodSnapshot();
  let foodHonesty: ColMoverHonesty = "seed";
  let stapleItems = seedFood.stapleItems;
  let foodAsOf = seedFood.asOf;

  try {
    const liveFood = await getFoodData();
    stapleItems = liveFood.stapleItems;
    foodAsOf = liveFood.asOf;
    foodHonesty = liveFood.provenance === "seed" ? "seed" : "live";
  } catch {
    // keep seed staples
  }

  for (const item of stapleItems) {
    const previousLkr =
      PREVIOUS_STAPLE_PRICES[item.slug] ??
      seedFood.stapleItems.find((seed) => seed.slug === item.slug)?.priceLkr;
    if (previousLkr == null) {
      continue;
    }
    const mover = toMover({
      id: `food_${item.slug}`,
      label: item.name,
      category: "food",
      unit: `LKR/${item.unit}`,
      previousLkr,
      currentLkr: item.priceLkr,
      asOf: foodAsOf.slice(0, 10),
      honesty: foodHonesty,
    });
    if (mover) {
      movers.push(mover);
    }
  }

  return movers
    .sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct))
    .slice(0, limit);
}
