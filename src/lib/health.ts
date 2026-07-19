import dengueData from "@/data/dengue-seed.json";
import { fetchLiveDengueSnapshot } from "./integrations/dengue";
import type { DengueSnapshot, DengueRiskLevel } from "./types";

const snapshot = dengueData as DengueSnapshot;

export function getDengueSnapshot(): DengueSnapshot {
  return snapshot;
}

export async function getDengueData(): Promise<DengueSnapshot> {
  return (await fetchLiveDengueSnapshot()) ?? snapshot;
}

export function getDengueDistrictStats(slug: string) {
  return snapshot.districts.find((district) => district.slug === slug);
}

export function getDengueRiskColor(level: DengueRiskLevel): string {
  switch (level) {
    case "high":
      return "#ffffff";
    case "moderate":
      return "#a3a3a3";
    case "low":
      return "#d4d4d4";
    default: {
      const _exhaustive: never = level;
      return _exhaustive;
    }
  }
}

export function getMaxDengueCases(): number {
  return Math.max(...snapshot.districts.map((district) => district.cases), 1);
}
