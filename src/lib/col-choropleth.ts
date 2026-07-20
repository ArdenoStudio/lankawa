import type { CostOfLivingDistrict } from "./types";

/** Monochrome fill opacity 0.08–0.85 from COL index vs max. */
export function colFillOpacity(index: number, maxIndex: number): number {
  if (!Number.isFinite(index) || maxIndex <= 0) {
    return 0.08;
  }
  const ratio = Math.min(1, Math.max(0, index / maxIndex));
  return 0.08 + ratio * 0.77;
}

export function maxColIndex(districts: CostOfLivingDistrict[]): number {
  return Math.max(...districts.map((d) => d.index), 1);
}

export function colIndexBySlug(
  districts: CostOfLivingDistrict[],
): Map<string, CostOfLivingDistrict> {
  return new Map(districts.map((d) => [d.slug, d]));
}

/** Compact SVG table-map cell shade class (0–4 buckets). */
export function colShadeBucket(index: number, maxIndex: number): number {
  if (!Number.isFinite(index) || maxIndex <= 0) {
    return 0;
  }
  const ratio = Math.min(1, Math.max(0, index / maxIndex));
  return Math.min(4, Math.floor(ratio * 5));
}
