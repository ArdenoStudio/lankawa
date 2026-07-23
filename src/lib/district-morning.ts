import { getCostOfLivingForDistrict, getCostOfLivingSnapshot } from "./cost-of-living";
import { DISTRICTS } from "./districts";
import {
  getEnvironmentData,
  getEnvironmentForDistrict,
  getEnvironmentSnapshot,
} from "./environment";
import { getDengueData, getDengueDistrictStats } from "./health";
import { getLandChangeForDistrict } from "./land-change";
import type { DengueSnapshot, EnvironmentSnapshot } from "./types";

export interface DistrictMorningColNote {
  index: number;
  rank: number;
  vsNational: number;
}

export interface DistrictMorningPackData {
  slug: string;
  dengue: number | null;
  dengueIsSeed: boolean;
  aqi: number | null;
  aqiIsSeed: boolean;
  colNote: DistrictMorningColNote | null;
  landDelta: number | null;
  /** Land-change remains a curated seed pulse for now. */
  landIsSeed: boolean;
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

function sourceIdIsSeed(sourceId: string): boolean {
  return sourceId.toLowerCase().includes("seed");
}

function aqiDistrictIsSeed(
  slug: string,
  environment: EnvironmentSnapshot,
  seedEnvironment: EnvironmentSnapshot,
): boolean {
  if (sourceIdIsSeed(environment.sourceId)) {
    return true;
  }

  // Mixed live + seed coverage keeps a live sourceId; treat districts that
  // still match the seed snapshot as seed when the source name says so.
  const mixedSeed =
    environment.sourceName.toLowerCase().includes("seed") ||
    environment.sourceName.toLowerCase().includes("mixed");
  if (!mixedSeed) {
    return false;
  }

  const live = environment.districts.find((district) => district.slug === slug);
  const seed = seedEnvironment.districts.find(
    (district) => district.slug === slug,
  );
  if (!live || !seed) {
    return true;
  }

  return live.aqi === seed.aqi && live.pm25 === seed.pm25;
}

function packFromSnapshots(
  slug: string,
  dengue: DengueSnapshot,
  environment: EnvironmentSnapshot,
  seedEnvironment: EnvironmentSnapshot,
): DistrictMorningPackData {
  const dengueRow = dengue.districts.find((district) => district.slug === slug);
  const environmentRow = environment.districts.find(
    (district) => district.slug === slug,
  );
  const land = getLandChangeForDistrict(slug);

  return {
    slug,
    dengue: dengueRow?.cases ?? null,
    dengueIsSeed: sourceIdIsSeed(dengue.sourceId),
    aqi: environmentRow?.aqi ?? null,
    aqiIsSeed: aqiDistrictIsSeed(slug, environment, seedEnvironment),
    colNote: buildColNote(slug),
    landDelta: land?.greeneryDelta ?? null,
    landIsSeed: true,
  };
}

/** Sync seed-only pack — prefer `buildDistrictMorningPacks` on live surfaces. */
export function getDistrictMorningPack(slug: string): DistrictMorningPackData {
  const dengue = getDengueDistrictStats(slug);
  const environment = getEnvironmentForDistrict(slug);
  const land = getLandChangeForDistrict(slug);

  return {
    slug,
    dengue: dengue?.cases ?? null,
    dengueIsSeed: true,
    aqi: environment?.aqi ?? null,
    aqiIsSeed: true,
    colNote: buildColNote(slug),
    landDelta: land?.greeneryDelta ?? null,
    landIsSeed: true,
  };
}

/** Sync seed-only packs — prefer `buildDistrictMorningPacks` on live surfaces. */
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

export async function buildDistrictMorningPacks(): Promise<
  Record<string, DistrictMorningPackData>
> {
  const [dengue, environment] = await Promise.all([
    getDengueData(),
    getEnvironmentData(),
  ]);
  const seedEnvironment = getEnvironmentSnapshot();

  return Object.fromEntries(
    DISTRICTS.map((district) => [
      district.slug,
      packFromSnapshots(
        district.slug,
        dengue,
        environment,
        seedEnvironment,
      ),
    ]),
  );
}
