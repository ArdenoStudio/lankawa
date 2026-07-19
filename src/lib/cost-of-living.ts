import colData from "@/data/cost-of-living-seed.json";
import { getFoodData } from "@/lib/integrations/food";
import { fetchOctanePrices, pickCpcPrice } from "@/lib/integrations/octane";
import { getPropertyData } from "@/lib/integrations/propertylk";
import type { CostOfLivingDistrict, CostOfLivingSnapshot } from "./types";

const seedSnapshot = colData as CostOfLivingSnapshot;

export function getCostOfLivingSnapshot(): CostOfLivingSnapshot {
  return seedSnapshot;
}

export async function getCostOfLivingData(): Promise<CostOfLivingSnapshot> {
  const [fuelResult, foodResult, propertyResult] = await Promise.allSettled([
    fetchOctanePrices(),
    getFoodData(),
    getPropertyData(),
  ]);

  let fuelPrice = seedSnapshot.fuelPricePetrol92;
  let liveFuel = false;
  if (fuelResult.status === "fulfilled") {
    const petrol92 = pickCpcPrice(fuelResult.value.prices, "petrol_92");
    if (petrol92?.price_lkr) {
      fuelPrice = Math.round(petrol92.price_lkr);
      liveFuel = true;
    }
  }

  let foodBasketNational = seedSnapshot.districts.find((d) => d.slug === "colombo")
    ?.foodBasketLkr;
  let liveFood = false;
  if (foodResult.status === "fulfilled" && foodResult.value.provenance !== "seed") {
    foodBasketNational = foodResult.value.essentialsBasketLkr;
    liveFood = true;
  }

  let liveProperty = false;
  const propertyBySlug = new Map<string, number>();
  if (propertyResult.status === "fulfilled") {
    const property = propertyResult.value;
    if (property.sourceId !== "propertylk_seed") {
      liveProperty = true;
      const colombo =
        property.districts.find((d) => d.slug === "colombo")?.medianPerPerch ?? 1;
      for (const district of property.districts) {
        propertyBySlug.set(
          district.slug,
          Math.round((district.medianPerPerch / colombo) * 100),
        );
      }
    }
  }

  const liveInputs = liveFuel || liveFood || liveProperty;
  if (!liveInputs) {
    return seedSnapshot;
  }

  const seedColomboFood =
    seedSnapshot.districts.find((d) => d.slug === "colombo")?.foodBasketLkr ??
    70_000;
  const foodScale =
    foodBasketNational && seedColomboFood > 0
      ? foodBasketNational / seedColomboFood
      : 1;

  const districts: CostOfLivingDistrict[] = seedSnapshot.districts.map(
    (district) => {
      const propertyComponent =
        propertyBySlug.get(district.slug) ?? district.propertyComponent;
      const foodBasketLkr = Math.round(district.foodBasketLkr * foodScale);
      const fuelComponent = 100;
      // Keep relative ranking from seed index; refresh components from live inputs.
      const index = Math.round(
        district.index * 0.55 +
          propertyComponent * 0.25 +
          (foodBasketLkr / seedColomboFood) * 100 * 0.2,
      );

      return {
        ...district,
        fuelComponent,
        propertyComponent,
        foodBasketLkr,
        index,
      };
    },
  );

  districts.sort((a, b) => b.index - a.index);
  const ranked = districts.map((district, rank) => ({
    ...district,
    rank: rank + 1,
  }));

  const nationalIndex = Math.round(
    ranked.reduce((sum, district) => sum + district.index, 0) / ranked.length,
  );

  return {
    sourceId: "cost_of_living_composite",
    sourceName: "Lankawa cost of living composite",
    asOf: new Date().toISOString().slice(0, 10),
    nationalIndex,
    fuelPricePetrol92: fuelPrice,
    districts: ranked,
  };
}

export function getCostOfLivingForDistrict(
  slug: string,
): CostOfLivingDistrict | undefined {
  return seedSnapshot.districts.find((district) => district.slug === slug);
}

export function getRankedCostOfLivingDistricts(): CostOfLivingDistrict[] {
  return [...seedSnapshot.districts].sort((a, b) => a.rank - b.rank);
}

export function formatColIndex(index: number): string {
  return index.toFixed(0);
}

export function getColIndexColor(index: number, nationalIndex: number): string {
  const ratio = index / nationalIndex;
  if (ratio >= 1.2) {
    return "#f5f5f5";
  }
  if (ratio >= 1.0) {
    return "#e5e5e5";
  }
  if (ratio >= 0.85) {
    return "#d4d4d4";
  }
  return "#737373";
}
