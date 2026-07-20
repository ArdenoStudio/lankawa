import seed from "@/data/urban-heat-seed.json";

export interface UrbanHeatNote {
  sourceId: string;
  sourceName: string;
  asOf: string;
  monthLabel: string;
  city: string;
  districtSlug: string;
  lstAnomalyC: number;
  nightMinC: number;
  note: string;
  methodologyNote: string;
  isSeed: boolean;
}

export function getUrbanHeatNote(): UrbanHeatNote {
  return {
    ...seed,
    isSeed: true,
  };
}
