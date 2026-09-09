import districtSeedData from "@/data/districts.json" with { type: "json" };
import type { District } from "./types";

interface DistrictSeedRow extends District {
  latitude: number;
  longitude: number;
  cities: unknown[];
}

const seed = districtSeedData as { districts: DistrictSeedRow[] };

/**
 * Canonical district registry, sourced from `src/data/districts.json`.
 * Populations come from the DCS Census of Population and Housing 2024
 * Final Report (Table 3.2) via `npm run update:census` — do not edit
 * population values by hand.
 */
export const DISTRICTS: District[] = seed.districts.map(
  ({
    slug,
    name,
    nameSi,
    nameTa,
    province,
    capital,
    population,
    areaSqKm,
  }) => ({
    slug,
    name,
    nameSi,
    nameTa,
    province,
    capital,
    population,
    areaSqKm,
  }),
);

export function getDistrict(slug: string): District | undefined {
  return DISTRICTS.find((district) => district.slug === slug);
}

export function getDistrictName(district: District, locale: string): string {
  if (locale === "si") {
    return district.nameSi;
  }
  if (locale === "ta") {
    return district.nameTa;
  }
  return district.name;
}
