import censusData from "@/data/census-2024-seed.json";
import livingData from "@/data/census-living-conditions.json";

export interface CensusDistrictFootnote {
  slug: string;
  population2024: number;
  note: string;
}

export interface Census2024Snapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  isSeed: boolean;
  methodologyNote: string;
  nationalPopulation: number;
  districts: CensusDistrictFootnote[];
}

const seed = censusData as Census2024Snapshot;

export interface CensusLivingDistrictRow {
  slug: string;
  households: number;
  cleanCookingPct: number | null;
  pipeBorneWaterPct: number | null;
  improvedSanitationPct: number | null;
  gridElectricityPct: number | null;
}

export interface CensusLivingConditions {
  asOf: string;
  isSeed: boolean;
  sourceName: string;
  national: Omit<CensusLivingDistrictRow, "slug">;
  districts: CensusLivingDistrictRow[];
}

const livingSeed = livingData as unknown as CensusLivingConditions;

export function getCensus2024Snapshot(): Census2024Snapshot {
  return seed;
}

export function getCensusFootnoteForDistrict(
  slug: string,
): CensusDistrictFootnote | undefined {
  return seed.districts.find((district) => district.slug === slug);
}

export function getCensusLivingConditions(): CensusLivingConditions {
  return livingSeed;
}

export function getCensusLivingForDistrict(
  slug: string,
): CensusLivingDistrictRow | undefined {
  return livingSeed.districts.find((row) => row.slug === slug);
}

export function formatCensusPopulation(
  value: number,
  locale = "en",
): string {
  return value.toLocaleString(locale);
}
