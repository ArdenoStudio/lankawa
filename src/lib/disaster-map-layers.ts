export const DISASTER_MAP_LAYER_IDS = [
  "flood",
  "landslide",
  "gfm",
  "firms",
  "gdacs",
  "gauges",
] as const;

export type DisasterMapLayerId = (typeof DISASTER_MAP_LAYER_IDS)[number];

export const DISASTER_MAP_PRESETS: Record<string, DisasterMapLayerId[]> = {
  monsoon: ["flood", "landslide", "gauges", "gfm"],
  wildfire: ["firms", "landslide"],
  cyclone: ["gdacs", "flood", "gauges"],
  baseline: ["flood", "landslide"],
};

const LAYER_SET = new Set<string>(DISASTER_MAP_LAYER_IDS);

const DEFAULT_LAYERS: DisasterMapLayerId[] = ["landslide", "flood"];

function isLayerId(value: string): value is DisasterMapLayerId {
  return LAYER_SET.has(value);
}

/** Parse comma-separated layer ids; invalid tokens dropped; empty → default. */
export function parseDisasterMapLayers(
  raw: string | null | undefined,
): DisasterMapLayerId[] {
  if (!raw || !raw.trim()) {
    return [...DEFAULT_LAYERS];
  }
  const seen = new Set<DisasterMapLayerId>();
  const layers: DisasterMapLayerId[] = [];
  for (const part of raw.split(",")) {
    const id = part.trim().toLowerCase();
    if (!isLayerId(id) || seen.has(id)) {
      continue;
    }
    seen.add(id);
    layers.push(id);
  }
  return layers.length > 0 ? layers : [...DEFAULT_LAYERS];
}

/** Return preset layer list, or null if unknown / empty. */
export function parseDisasterMapPreset(
  raw: string | null | undefined,
): DisasterMapLayerId[] | null {
  if (!raw || !raw.trim()) {
    return null;
  }
  const key = raw.trim().toLowerCase();
  const layers = DISASTER_MAP_PRESETS[key];
  return layers ? [...layers] : null;
}

export function serializeDisasterMapLayers(layers: DisasterMapLayerId[]): string {
  return layers.join(",");
}

export function isDisasterMapLayerOn(
  layers: readonly DisasterMapLayerId[],
  id: DisasterMapLayerId,
): boolean {
  return layers.includes(id);
}
