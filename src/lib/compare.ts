import { getPopulationDensity } from "./district-stats";
import { getDistrict, getDistrictName } from "./districts";
import type { District } from "./types";
import {
  getDistrictWinnerPercentage,
  getElectionCandidate,
  getElectionDistrictResult,
  getParliamentaryDistrictForAdminDistrict,
  getParliamentaryParty,
} from "./elections";
import { getFloodStationsForDistrict } from "./flood-districts";
import { getDengueDistrictStats } from "./health";
import { getPublicServicesForDistrict } from "./services";
import { getCostOfLivingForDistrict } from "./cost-of-living";

export interface DistrictCompareRow {
  slug: string;
  name: string;
  district: District;
  population: number;
  density: number;
  areaSqKm: number;
  presidentialWinner: string | null;
  presidentialShare: number | null;
  parliamentaryWinner: string | null;
  parliamentarySeats: string | null;
  floodStationCount: number;
  servicesCount: number;
  dengueCases: number | null;
  costOfLivingIndex: number | null;
}

export function parseCompareDistricts(raw: string | null | undefined): string[] {
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((slug) => slug.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 4);
}

export function buildDistrictCompareRow(
  slug: string,
  locale: string,
): DistrictCompareRow | null {
  const district = getDistrict(slug);
  if (!district) {
    return null;
  }

  const election = getElectionDistrictResult(slug);
  const parliamentary = getParliamentaryDistrictForAdminDistrict(slug);
  const dengue = getDengueDistrictStats(slug);
  const col = getCostOfLivingForDistrict(slug);

  let presidentialWinner: string | null = null;
  let presidentialShare: number | null = null;
  if (election) {
    const candidate = getElectionCandidate(election.winner);
    presidentialWinner = candidate?.party ?? null;
    presidentialShare = getDistrictWinnerPercentage(election);
  }

  let parliamentaryWinner: string | null = null;
  let parliamentarySeats: string | null = null;
  if (parliamentary) {
    const party = getParliamentaryParty(parliamentary.winner);
    parliamentaryWinner = party?.abbreviation ?? null;
    parliamentarySeats = `${parliamentary.seats[parliamentary.winner]}/${parliamentary.totalSeats}`;
  }

  return {
    slug,
    name: getDistrictName(district, locale),
    district,
    population: district.population,
    density: getPopulationDensity(district),
    areaSqKm: district.areaSqKm,
    presidentialWinner,
    presidentialShare,
    parliamentaryWinner,
    parliamentarySeats,
    floodStationCount: getFloodStationsForDistrict(slug).length,
    servicesCount: getPublicServicesForDistrict(slug).length,
    dengueCases: dengue?.cases ?? null,
    costOfLivingIndex: col?.index ?? null,
  };
}

export function buildDistrictCompareRows(
  slugs: string[],
  locale: string,
): DistrictCompareRow[] {
  return slugs
    .map((slug) => buildDistrictCompareRow(slug, locale))
    .filter((row): row is DistrictCompareRow => row != null);
}
