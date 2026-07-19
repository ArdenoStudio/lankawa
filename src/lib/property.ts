import propertyData from "@/data/property-seed.json";
import type { PropertyDistrictPrice, PropertySnapshot } from "./types";

const snapshot = propertyData as PropertySnapshot;

export function getPropertySnapshot(): PropertySnapshot {
  return snapshot;
}

export function getPropertyDistrictPrice(
  slug: string,
): PropertyDistrictPrice | undefined {
  return snapshot.districts.find((district) => district.slug === slug);
}

export function getMaxPropertyMedian(
  snapshot: PropertySnapshot = getPropertySnapshot(),
): number {
  return Math.max(
    ...snapshot.districts.map((district) => district.medianPerPerch),
    1,
  );
}

export function getNationalMedianPerPerch(
  snapshot: PropertySnapshot = getPropertySnapshot(),
): number {
  const sorted = [...snapshot.districts].sort(
    (a, b) => a.medianPerPerch - b.medianPerPerch,
  );
  const mid = Math.floor(sorted.length / 2);
  return sorted[mid]?.medianPerPerch ?? 0;
}

export function formatPropertyPrice(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toLocaleString();
}

export { getPropertyData } from "./integrations/propertylk";

export function getPropertyPriceColor(median: number, maxMedian: number): string {
  const ratio = median / maxMedian;
  if (ratio >= 0.75) {
    return "#f5f5f5";
  }
  if (ratio >= 0.5) {
    return "#e5e5e5";
  }
  if (ratio >= 0.3) {
    return "#d4d4d4";
  }
  if (ratio >= 0.15) {
    return "#a3a3a3";
  }
  return "#737373";
}
