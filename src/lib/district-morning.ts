import { getCostOfLivingForDistrict, getCostOfLivingSnapshot } from "./cost-of-living";
import { DISTRICTS } from "./districts";
import { getEnvironmentForDistrict } from "./environment";
import { getDengueDistrictStats } from "./health";
import { getLandChangeForDistrict } from "./land-change";

export interface DistrictMorningColNote {
  index: number;
  rank: number;
  vsNational: number;
}

export interface DistrictMorningPackData {
  slug: string;
  dengue: number | null;
  aqi: number | null;
  colNote: DistrictMorningColNote | null;
  landDelta: number | null;
}

function buildColNote(slug: string): DistrictMorningColNote | null {
  const col = getCostOfLivingForDistrict(slug);
  if (!col) {
    return null;
  }

  const national = getCostOfLivingSnapshot().nationalIndex;
  return {
    index: col.index,
    rank: col.rank,
    vsNational: col.index - national,
  };
}

export function getDistrictMorningPack(slug: string): DistrictMorningPackData {
  const dengue = getDengueDistrictStats(slug);
  const environment = getEnvironmentForDistrict(slug);
  const land = getLandChangeForDistrict(slug);

  return {
    slug,
    dengue: dengue?.cases ?? null,
    aqi: environment?.aqi ?? null,
    colNote: buildColNote(slug),
    landDelta: land?.greeneryDelta ?? null,
  };
}

export function getAllDistrictMorningPacks(): Record<
  string,
  DistrictMorningPackData
> {
  return Object.fromEntries(
    DISTRICTS.map((district) => [
      district.slug,
      getDistrictMorningPack(district.slug),
    ]),
  );
}
