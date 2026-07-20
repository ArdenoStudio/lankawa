import seed from "@/data/vehicle-model-medians-seed.json";

export interface VehicleModelMedian {
  make: string;
  model: string;
  districtSlug: string;
  medianPriceLkr: number;
  listingCount: number;
}

export interface VehicleModelDeepDiveSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  methodologyNote: string;
  isSeed: boolean;
  models: VehicleModelMedian[];
}

const models = seed.models as VehicleModelMedian[];

export function getVehicleModelDeepDive(): VehicleModelDeepDiveSnapshot {
  return {
    sourceId: seed.sourceId,
    sourceName: seed.sourceName,
    asOf: seed.asOf,
    methodologyNote: seed.methodologyNote,
    isSeed: true,
    models: [...models],
  };
}

export function filterVehicleModels(filters: {
  districtSlug?: string;
  make?: string;
}): VehicleModelMedian[] {
  return models.filter((row) => {
    if (filters.districtSlug && row.districtSlug !== filters.districtSlug) {
      return false;
    }
    if (
      filters.make &&
      row.make.toLowerCase() !== filters.make.trim().toLowerCase()
    ) {
      return false;
    }
    return true;
  });
}

export function uniqueVehicleMakes(): string[] {
  return [...new Set(models.map((row) => row.make))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function uniqueVehicleModelDistricts(): string[] {
  return [...new Set(models.map((row) => row.districtSlug))].sort((a, b) =>
    a.localeCompare(b),
  );
}
