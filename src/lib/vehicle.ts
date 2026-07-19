import vehicleData from "@/data/vehicle-seed.json";
import type { VehicleDistrictPrice, VehicleSnapshot } from "./types";

const snapshot = vehicleData as VehicleSnapshot;

export function getVehicleSnapshot(): VehicleSnapshot {
  return snapshot;
}

export function getVehicleDistrictPrice(
  slug: string,
): VehicleDistrictPrice | undefined {
  return snapshot.districts.find((district) => district.slug === slug);
}

export function formatVehiclePrice(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toLocaleString();
}

export { getVehicleData } from "./integrations/vehicle";
