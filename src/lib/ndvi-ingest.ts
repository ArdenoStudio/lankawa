import { getLandChangeSnapshot } from "@/lib/land-change";

export type NdviObservationRow = {
  source_id: string;
  metric: string;
  value: number;
  unit: string | null;
  observed_at: string;
  meta?: Record<string, unknown>;
};

/**
 * P40 — weekly NDVI cron path scaffold.
 * Writes seed land-pulse NDVI anomaly rows into the observations shape.
 * Live ETL can replace the seed reader later without changing the cron contract.
 */
export function buildNdviObservationRows(
  observedAt: string = new Date().toISOString(),
): NdviObservationRow[] {
  const snapshot = getLandChangeSnapshot();
  const rows: NdviObservationRow[] = [
    {
      source_id: snapshot.sourceId,
      metric: "ndvi_anomaly_national",
      value: snapshot.national.ndviAnomaly,
      unit: "z",
      observed_at: observedAt,
      meta: {
        weekLabel: snapshot.national.ndviWeekLabel,
        path: "seed_scaffold",
      },
    },
  ];

  for (const district of snapshot.districts) {
    rows.push({
      source_id: snapshot.sourceId,
      metric: "ndvi_anomaly",
      value: district.ndviAnomaly,
      unit: "z",
      observed_at: observedAt,
      meta: {
        districtSlug: district.slug,
        weekLabel: district.ndviWeekLabel,
        path: "seed_scaffold",
      },
    });
  }

  return rows;
}
