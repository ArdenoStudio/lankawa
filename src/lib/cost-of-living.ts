import colData from "@/data/cost-of-living-seed.json";
import type { CostOfLivingDistrict, CostOfLivingSnapshot } from "./types";

const snapshot = colData as CostOfLivingSnapshot;

export function getCostOfLivingSnapshot(): CostOfLivingSnapshot {
  return snapshot;
}

export function getCostOfLivingForDistrict(
  slug: string,
): CostOfLivingDistrict | undefined {
  return snapshot.districts.find((district) => district.slug === slug);
}

export function getRankedCostOfLivingDistricts(): CostOfLivingDistrict[] {
  return [...snapshot.districts].sort((a, b) => a.rank - b.rank);
}

export function formatColIndex(index: number): string {
  return index.toFixed(0);
}

export function getColIndexColor(index: number, nationalIndex: number): string {
  const ratio = index / nationalIndex;
  if (ratio >= 1.2) {
    return "#0f766e";
  }
  if (ratio >= 1.0) {
    return "#14b8a6";
  }
  if (ratio >= 0.85) {
    return "#2dd4bf";
  }
  return "#99f6e4";
}
