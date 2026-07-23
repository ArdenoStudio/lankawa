import type { FloodAlertSummary } from "@/lib/types";

/** Static mapping of flood monitoring stations to administrative district slugs. */
const STATION_TO_DISTRICT: Record<string, string> = {
  "Nagalagam Street": "colombo",
  Hanwella: "colombo",
  Glencourse: "colombo",
  Kithulgala: "kegalle",
  Holombuwa: "kegalle",
  Deraniyagala: "kegalle",
  Norwood: "nuwara-eliya",
  Putupaula: "ratnapura",
  Ellagawa: "ratnapura",
  Rathnapura: "ratnapura",
  Magura: "ratnapura",
  Kalawellawa: "ratnapura",
  Baddegama: "galle",
  Thawalama: "galle",
  Thalgahagoda: "galle",
  Panadugama: "matara",
  Pitabeddara: "matara",
  Urawa: "matara",
  Moraketiya: "matara",
  Thanamalwila: "monaragala",
  Wellawaya: "monaragala",
  "Kuda Oya": "monaragala",
  Katharagama: "monaragala",
  Nakkala: "ampara",
  Siyambalanduwa: "monaragala",
  Padiyathalawa: "ampara",
  Manampitiya: "polonnaruwa",
  Weraganthota: "badulla",
  Peradeniya: "kandy",
  Nawalapitiya: "kandy",
  Thaldena: "badulla",
  Horowpothana: "anuradhapura",
  "Yaka Wewa": "anuradhapura",
  Thanthirimale: "anuradhapura",
  Galgamuwa: "kurunegala",
  Moragaswewa: "anuradhapura",
  Badalgama: "puttalam",
  Giriulla: "kurunegala",
  Dunamale: "kurunegala",
};

export function getFloodStationsForDistrict(slug: string): string[] {
  return Object.entries(STATION_TO_DISTRICT)
    .filter(([, districtSlug]) => districtSlug === slug)
    .map(([station]) => station)
    .sort((a, b) => a.localeCompare(b));
}

export function getDistrictForFloodStation(station: string): string | undefined {
  return STATION_TO_DISTRICT[station];
}

export type FloodDistrictAttention = {
  slug: string;
  maxAlertLevel: string;
  stationCount: number;
};

function pickWorse(a: string, b: string): string {
  const rank = (x: string) => {
    const u = x.toUpperCase();
    if (u.includes("MAJOR") || u.includes("RED") || u.includes("DANGER")) {
      return 4;
    }
    if (u.includes("WARNING") || u.includes("ORANGE")) {
      return 3;
    }
    if (
      u.includes("ALERT") ||
      u.includes("YELLOW") ||
      u.includes("MINOR")
    ) {
      return 2;
    }
    if (u !== "NORMAL") {
      return 1;
    }
    return 0;
  };
  return rank(b) > rank(a) ? b : a;
}

/**
 * Aggregate non-NORMAL flood station alerts into district-level attention
 * for choropleth fill intensity.
 */
export function floodAttentionByDistrict(
  summaries: FloodAlertSummary[],
): Map<string, FloodDistrictAttention> {
  const map = new Map<string, FloodDistrictAttention>();
  for (const summary of summaries) {
    const level = summary.alertLevel?.toUpperCase?.() ?? "NORMAL";
    if (level === "NORMAL") {
      continue;
    }
    if (summary.count === 0) {
      continue;
    }
    for (const station of summary.stations ?? []) {
      const name = typeof station === "string" ? station : String(station);
      const slug = getDistrictForFloodStation(name);
      if (!slug) {
        continue;
      }
      const existing = map.get(slug);
      if (!existing) {
        map.set(slug, { slug, maxAlertLevel: level, stationCount: 1 });
      } else {
        existing.stationCount += 1;
        existing.maxAlertLevel = pickWorse(existing.maxAlertLevel, level);
      }
    }
  }
  return map;
}

/** Monochrome fill opacity for flood district attention (not official colour codes). */
export function floodDistrictOpacity(maxAlertLevel: string | undefined): number {
  if (!maxAlertLevel) {
    return 0.08;
  }
  const u = maxAlertLevel.toUpperCase();
  if (u.includes("MAJOR") || u.includes("RED") || u.includes("DANGER")) {
    return 0.75;
  }
  if (u.includes("WARNING") || u.includes("ORANGE")) {
    return 0.55;
  }
  if (u.includes("ALERT") || u.includes("YELLOW") || u.includes("MINOR")) {
    return 0.35;
  }
  return 0.15;
}
