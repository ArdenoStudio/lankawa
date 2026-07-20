import censusData from "@/data/census-2024-seed.json";

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

export function getCensus2024Snapshot(): Census2024Snapshot {
  return seed;
}

export function getCensusFootnoteForDistrict(
  slug: string,
): CensusDistrictFootnote | undefined {
  return seed.districts.find((district) => district.slug === slug);
}

export function formatCensusPopulation(
  value: number,
  locale = "en",
): string {
  return value.toLocaleString(locale);
}
