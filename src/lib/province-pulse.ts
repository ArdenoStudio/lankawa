import { getDistrictForFloodStation } from "./flood-districts";
import { getEnvironmentData } from "./environment";
import { getDengueData } from "./health";
import { fetchLatestFloodLevels } from "./integrations/flood";

export interface ProvincePulseSummary {
  dengueCases: number;
  dengueIsSeed: boolean;
  averageAqi: number | null;
  aqiDistrictCount: number;
  aqiIsSeed: boolean;
  floodElevatedCount: number | null;
}

function isElevatedAlert(status: string | undefined): boolean {
  const key = (status ?? "").toUpperCase();
  return key !== "" && key !== "NORMAL" && key !== "UNKNOWN" && key !== "NONE";
}

function sourceIdIsSeed(sourceId: string): boolean {
  return sourceId.toLowerCase().includes("seed");
}

export async function getProvincePulse(
  districtSlugs: string[],
): Promise<ProvincePulseSummary> {
  const slugSet = new Set(districtSlugs);

  const [dengue, environment] = await Promise.all([
    getDengueData(),
    getEnvironmentData(),
  ]);

  let dengueCases = 0;
  for (const slug of districtSlugs) {
    dengueCases +=
      dengue.districts.find((district) => district.slug === slug)?.cases ?? 0;
  }

  const aqiValues = districtSlugs
    .map(
      (slug) =>
        environment.districts.find((district) => district.slug === slug)?.aqi,
    )
    .filter((value): value is number => value != null);

  const averageAqi =
    aqiValues.length > 0
      ? Math.round(
          aqiValues.reduce((sum, value) => sum + value, 0) / aqiValues.length,
        )
      : null;

  let floodElevatedCount: number | null = null;
  try {
    const levels = await fetchLatestFloodLevels();
    floodElevatedCount = levels.filter((level) => {
      const district = getDistrictForFloodStation(level.stationName);
      return (
        district != null &&
        slugSet.has(district) &&
        isElevatedAlert(level.alertStatus)
      );
    }).length;
  } catch {
    floodElevatedCount = null;
  }

  return {
    dengueCases,
    dengueIsSeed: sourceIdIsSeed(dengue.sourceId),
    averageAqi,
    aqiDistrictCount: aqiValues.length,
    aqiIsSeed: sourceIdIsSeed(environment.sourceId),
    floodElevatedCount,
  };
}
