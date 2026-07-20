import { getDistrictForFloodStation } from "./flood-districts";
import { getEnvironmentForDistrict } from "./environment";
import { getDengueDistrictStats } from "./health";
import { fetchLatestFloodLevels } from "./integrations/flood";

export interface ProvincePulseSummary {
  dengueCases: number;
  averageAqi: number | null;
  aqiDistrictCount: number;
  floodElevatedCount: number | null;
}

function isElevatedAlert(status: string | undefined): boolean {
  const key = (status ?? "").toUpperCase();
  return key !== "" && key !== "NORMAL" && key !== "UNKNOWN" && key !== "NONE";
}

export async function getProvincePulse(
  districtSlugs: string[],
): Promise<ProvincePulseSummary> {
  const slugSet = new Set(districtSlugs);

  let dengueCases = 0;
  for (const slug of districtSlugs) {
    dengueCases += getDengueDistrictStats(slug)?.cases ?? 0;
  }

  const aqiValues = districtSlugs
    .map((slug) => getEnvironmentForDistrict(slug)?.aqi)
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
    averageAqi,
    aqiDistrictCount: aqiValues.length,
    floodElevatedCount,
  };
}
