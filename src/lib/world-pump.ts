import seed from "@/data/world-pump-seed.json";
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
}

export function getWorldPumpSnapshot(options?: {
  sriLankaPetrolLkr?: number | null;
  usdLkr?: number | null;
}): WorldPumpSnapshot {
  const sriLankaUsdPerLitre =
    options?.sriLankaPetrolLkr != null &&
    options.usdLkr != null &&
    options.usdLkr > 0
      ? Number((options.sriLankaPetrolLkr / options.usdLkr).toFixed(2))
      : null;

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
  };
}
