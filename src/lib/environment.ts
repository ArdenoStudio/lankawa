import envData from "@/data/environment-seed.json";
import type { AqiBand, EnvironmentDistrictStat, EnvironmentSnapshot } from "./types";

export { getEnvironmentData } from "./integrations/aqi";

const snapshot = envData as EnvironmentSnapshot;

export function getEnvironmentSnapshot(): EnvironmentSnapshot {
  return snapshot;
}

export function getEnvironmentForDistrict(
  slug: string,
): EnvironmentDistrictStat | undefined {
  return snapshot.districts.find((district) => district.slug === slug);
}

export function getRankedEnvironmentDistricts(): EnvironmentDistrictStat[] {
  return [...snapshot.districts].sort((a, b) => b.aqi - a.aqi);
}

export function getAqiBandLabelKey(band: AqiBand): string {
  switch (band) {
    case "good":
      return "bandGood";
    case "moderate":
      return "bandModerate";
    case "unhealthy_sensitive":
      return "bandUnhealthySensitive";
    case "unhealthy":
      return "bandUnhealthy";
    case "very_unhealthy":
      return "bandVeryUnhealthy";
    default: {
      const _exhaustive: never = band;
      return _exhaustive;
    }
  }
}

export function getAqiBandColor(band: AqiBand): string {
  switch (band) {
    case "good":
      return "#e5e5e5";
    case "moderate":
      return "#d4d4d4";
    case "unhealthy_sensitive":
      return "#a3a3a3";
    case "unhealthy":
      return "#ffffff";
    case "very_unhealthy":
      return "#737373";
    default: {
      const _exhaustive: never = band;
      return _exhaustive;
    }
  }
}
