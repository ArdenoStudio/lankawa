import type { District } from "./types";

export function getPopulationDensity(district: District): number {
  return Math.round(district.population / district.areaSqKm);
}

export function getProvinceDistrictCount(
  province: string,
  districts: District[],
): number {
  return districts.filter((district) => district.province === province).length;
}

export function getProvincePopulationShare(
  district: District,
  districts: District[],
): number {
  const provinceTotal = districts
    .filter((item) => item.province === district.province)
    .reduce((sum, item) => sum + item.population, 0);
  return (district.population / provinceTotal) * 100;
}
