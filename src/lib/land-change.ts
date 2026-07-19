import landData from "@/data/land-change-seed.json";

export interface LandChangeDistrict {
  slug: string;
  greenery2018: number;
  greenery2024: number;
  builtUp2018: number;
  builtUp2024: number;
  greeneryDelta: number;
  builtUpDelta: number;
}

export interface LandChangeSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  methodologyNote: string;
  national: {
    greeneryIndex2018: number;
    greeneryIndex2024: number;
    builtUpIndex2018: number;
    builtUpIndex2024: number;
    greeneryDelta: number;
    builtUpDelta: number;
  };
  districts: LandChangeDistrict[];
  topGreeneryLoss: LandChangeDistrict[];
  topBuiltUpGain: LandChangeDistrict[];
}

const seed = landData;

export function getLandChangeSnapshot(): LandChangeSnapshot {
  const districts: LandChangeDistrict[] = seed.districts.map((district) => ({
    ...district,
    greeneryDelta: district.greenery2024 - district.greenery2018,
    builtUpDelta: district.builtUp2024 - district.builtUp2018,
  }));

  const topGreeneryLoss = [...districts]
    .sort((a, b) => a.greeneryDelta - b.greeneryDelta)
    .slice(0, 5);
  const topBuiltUpGain = [...districts]
    .sort((a, b) => b.builtUpDelta - a.builtUpDelta)
    .slice(0, 5);

  return {
    sourceId: seed.sourceId,
    sourceName: seed.sourceName,
    asOf: seed.asOf,
    methodologyNote: seed.methodologyNote,
    national: {
      ...seed.national,
      greeneryDelta:
        seed.national.greeneryIndex2024 - seed.national.greeneryIndex2018,
      builtUpDelta:
        seed.national.builtUpIndex2024 - seed.national.builtUpIndex2018,
    },
    districts,
    topGreeneryLoss,
    topBuiltUpGain,
  };
}
