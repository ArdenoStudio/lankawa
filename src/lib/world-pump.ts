import seed from "@/data/world-pump-seed.json";
import {
  fetchOctaneWorldComparison,
  type OctaneWorldComparison,
} from "@/lib/integrations/octane";
import { getSourceProvenancePath } from "@/lib/sources";

export interface WorldPumpPeer {
  id: string;
  name: string;
  petrolUsdPerLitre: number;
  note?: string;
  isSriLanka?: boolean;
  live?: boolean;
}

export interface WorldPumpSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  unit: string;
  methodologyNote: string;
  provenancePath: string;
  peers: WorldPumpPeer[];
  sriLankaUsdPerLitre: number | null;
  /** True when peers come from the curated seed rather than live Octane. */
  isSeed: boolean;
  /** Octane world gasoline average (USD/L) when live data is available. */
  worldAverageUsd: number | null;
  /** Sri Lanka's % delta vs the world average (negative = cheaper). */
  deltaVsWorldPct: number | null;
}

function slugifyPeerId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Pure mapper from the live Octane world payload to snapshot fields.
 * Exported for tests; returns null when the payload is unusable so the
 * caller can fall back to the curated seed.
 */
export function deriveLiveWorldPump(
  world: OctaneWorldComparison | null | undefined,
  sriLankaUsdPerLitre: number | null,
): Pick<
  WorldPumpSnapshot,
  "peers" | "asOf" | "worldAverageUsd" | "deltaVsWorldPct"
> | null {
  const neighbors = Array.isArray(world?.neighbors) ? world.neighbors : [];
  const usable = neighbors.filter(
    (neighbor) =>
      typeof neighbor?.country === "string" &&
      neighbor.country.length > 0 &&
      typeof neighbor?.price_usd === "number" &&
      Number.isFinite(neighbor.price_usd) &&
      neighbor.price_usd > 0,
  );
  if (usable.length === 0) {
    return null;
  }

  const livePeers: WorldPumpPeer[] = [
    ...(sriLankaUsdPerLitre != null
      ? [
          {
            id: "sri-lanka",
            name: "Sri Lanka",
            petrolUsdPerLitre: sriLankaUsdPerLitre,
            note: "Octane CPC petrol 92 ÷ CBSL USD/LKR",
            isSriLanka: true,
            live: true,
          },
        ]
      : []),
    ...usable.map((neighbor) => ({
      id: slugifyPeerId(neighbor.country),
      name: neighbor.country,
      petrolUsdPerLitre: neighbor.price_usd,
      note: `Octane live · recorded ${neighbor.recorded_at}`,
      isSriLanka: false,
      live: true,
    })),
  ].sort((a, b) => a.petrolUsdPerLitre - b.petrolUsdPerLitre);

  const recordedDates = usable
    .map((neighbor) => neighbor.recorded_at)
    .filter((value): value is string => typeof value === "string")
    .sort();
  const latestRecorded =
    recordedDates.length > 0
      ? recordedDates[recordedDates.length - 1]
      : new Date().toISOString().slice(0, 10);

  const worldAverage =
    typeof world?.world_average_usd === "number" &&
    Number.isFinite(world.world_average_usd) &&
    world.world_average_usd > 0
      ? world.world_average_usd
      : null;
  const deltaPct =
    typeof world?.delta_vs_world_pct === "number" &&
    Number.isFinite(world.delta_vs_world_pct)
      ? world.delta_vs_world_pct
      : null;

  return {
    peers: livePeers,
    asOf: latestRecorded,
    worldAverageUsd: worldAverage,
    deltaVsWorldPct: deltaPct,
  };
}

/**
 * "Petrol vs the region" card. Prefers the live Octane world-comparison feed;
 * falls back to the curated seed peers when Octane is unreachable. The Sri
 * Lanka row is always derived from Lankawa's own pulse (CPC petrol 92 ÷
 * CBSL USD/LKR) so the card stays consistent with the fuel cards beside it.
 */
export async function getWorldPumpSnapshot(options?: {
  sriLankaPetrolLkr?: number | null;
  usdLkr?: number | null;
}): Promise<WorldPumpSnapshot> {
  const sriLankaUsdPerLitre =
    options?.sriLankaPetrolLkr != null &&
    options.usdLkr != null &&
    options.usdLkr > 0
      ? Number((options.sriLankaPetrolLkr / options.usdLkr).toFixed(2))
      : null;

  try {
    const world = await fetchOctaneWorldComparison();
    const live = deriveLiveWorldPump(world, sriLankaUsdPerLitre);
    if (live) {
      return {
        sourceId: "world_pump_seed",
        sourceName: "Octane — world fuel comparison",
        asOf: live.asOf,
        unit: "USD per litre",
        methodologyNote:
          "Sri Lanka = Octane CPC petrol 92 ÷ CBSL USD/LKR. Peers = Octane world comparison, per-country recorded_at shown in the legend.",
        provenancePath: getSourceProvenancePath("world_pump_seed"),
        peers: live.peers,
        sriLankaUsdPerLitre,
        isSeed: false,
        worldAverageUsd: live.worldAverageUsd,
        deltaVsWorldPct: live.deltaVsWorldPct,
      };
    }
  } catch {
    // Octane unavailable — curated seed peers below keep the card useful.
  }

  const peers: WorldPumpPeer[] = [
    ...(sriLankaUsdPerLitre != null
      ? [
          {
            id: "sri-lanka",
            name: "Sri Lanka",
            petrolUsdPerLitre: sriLankaUsdPerLitre,
            note: "Octane CPC petrol 92 ÷ CBSL USD/LKR",
            isSriLanka: true,
            live: true,
          },
        ]
      : []),
    ...seed.peers.map((peer) => ({
      ...peer,
      isSriLanka: false,
      live: false,
    })),
  ].sort((a, b) => a.petrolUsdPerLitre - b.petrolUsdPerLitre);

  return {
    sourceId: seed.sourceId,
    sourceName: seed.sourceName,
    asOf: seed.asOf,
    unit: seed.unit,
    methodologyNote: seed.methodologyNote,
    provenancePath: getSourceProvenancePath("world_pump_seed"),
    peers,
    sriLankaUsdPerLitre,
    isSeed: true,
    worldAverageUsd: null,
    deltaVsWorldPct: null,
  };
}
