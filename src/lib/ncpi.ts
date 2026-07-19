import ncpiData from "@/data/ncpi-seed.json";

export interface NcpiSeriesPoint {
  period: string;
  label: string;
  index: number;
  yoyPct: number;
  momPct: number;
}

export interface NcpiSnapshot {
  sourceId: string;
  sourceName: string;
  base: string;
  asOf: string;
  releasedAt: string;
  periodLabel: string;
  methodologyNote: string;
  releaseUrl: string;
  latest: {
    index: number;
    yoyPct: number;
    momPct: number;
    coreYoyPct: number;
    foodYoyPct: number;
    nonFoodYoyPct: number;
  };
  series: NcpiSeriesPoint[];
}

const seed = ncpiData;

export function getNcpiSnapshot(): NcpiSnapshot {
  return {
    sourceId: seed.sourceId,
    sourceName: seed.sourceName,
    base: seed.base,
    asOf: seed.asOf,
    releasedAt: seed.releasedAt,
    periodLabel: seed.periodLabel,
    methodologyNote: seed.methodologyNote,
    releaseUrl: seed.releaseUrl,
    latest: seed.latest,
    series: seed.series,
  };
}
