import debtData from "@/data/foreign-debt-composition.json";

export interface ForeignDebtYearPoint {
  year: number;
  commercialPct: number;
  concessionaryPct: number;
}

export interface ForeignDebtSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  periodLabel: string;
  methodologyNote: string;
  attribution: {
    discovery: string;
    discoveryUrl: string;
    primarySource: string;
    articleUrl: string;
  };
  series: ForeignDebtYearPoint[];
  latest: ForeignDebtYearPoint;
  earliest: ForeignDebtYearPoint;
  commercialDeltaPts: number;
}

const seed = debtData;

export function getForeignDebtSnapshot(): ForeignDebtSnapshot {
  const series = [...seed.series].sort((a, b) => a.year - b.year);
  const earliest = series[0];
  const latest = series[series.length - 1];

  return {
    sourceId: seed.sourceId,
    sourceName: seed.sourceName,
    asOf: seed.asOf,
    periodLabel: seed.periodLabel,
    methodologyNote: seed.methodologyNote,
    attribution: seed.attribution,
    series,
    latest,
    earliest,
    commercialDeltaPts: Number(
      (latest.commercialPct - earliest.commercialPct).toFixed(2),
    ),
  };
}
