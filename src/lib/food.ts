import foodData from "@/data/food-seed.json";
import type { FoodDistrictMealCost, FoodSnapshot } from "./types";

const snapshot = foodData as FoodSnapshot;

export function getFoodSnapshot(): FoodSnapshot {
  return snapshot;
}

export function getFoodDistrictMealCost(
  slug: string,
): FoodDistrictMealCost | undefined {
  return snapshot.districts.find((district) => district.slug === slug);
}

export function formatFoodPrice(value: number): string {
  return value.toLocaleString();
}

export { getFoodData } from "./integrations/food";
