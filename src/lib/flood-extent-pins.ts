import seed from "@/data/flood-extent-pins-seed.json";

export type FloodExtentSeverity = "watch" | "elevated";

export interface FloodExtentPin {
  id: string;
  label: string;
  districtSlug: string;
  severity: FloodExtentSeverity;
  longitude: number;
  latitude: number;
}

export interface FloodExtentPinsSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  methodologyNote: string;
  isSeed: boolean;
  pins: FloodExtentPin[];
}

interface SeedFeature {
  type: string;
  properties: {
    id: string;
    label: string;
    districtSlug: string;
    severity: string;
  };
  geometry: { type: string; coordinates: number[] };
}

function isSeverity(value: string): value is FloodExtentSeverity {
  return value === "watch" || value === "elevated";
}

export function parseFloodExtentPins(
  features: SeedFeature[],
): FloodExtentPin[] {
  const pins: FloodExtentPin[] = [];
  for (const feature of features) {
    const coords = feature.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) {
      continue;
    }
    const [longitude, latitude] = coords;
    if (
      typeof longitude !== "number" ||
      typeof latitude !== "number" ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude)
    ) {
      continue;
    }
    const severity = feature.properties?.severity;
    if (!severity || !isSeverity(severity)) {
      continue;
    }
    pins.push({
      id: feature.properties.id,
      label: feature.properties.label,
      districtSlug: feature.properties.districtSlug,
      severity,
      longitude,
      latitude,
    });
  }
  return pins;
}

export function getFloodExtentPinsSnapshot(): FloodExtentPinsSnapshot {
  const features = (seed.features ?? []) as SeedFeature[];
  return {
    sourceId: seed.sourceId,
    sourceName: seed.sourceName,
    asOf: seed.asOf,
    methodologyNote: seed.methodologyNote,
    isSeed: true,
    pins: parseFloodExtentPins(features),
  };
}

export function floodExtentPinsAsGeoJson(pins: FloodExtentPin[]): {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: {
      id: string;
      label: string;
      districtSlug: string;
      severity: FloodExtentSeverity;
    };
    geometry: { type: "Point"; coordinates: [number, number] };
  }>;
} {
  return {
    type: "FeatureCollection",
    features: pins.map((pin) => ({
      type: "Feature" as const,
      properties: {
        id: pin.id,
        label: pin.label,
        districtSlug: pin.districtSlug,
        severity: pin.severity,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [pin.longitude, pin.latitude] as [number, number],
      },
    })),
  };
}
