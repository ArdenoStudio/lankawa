import macroObs from "@/data/macro-observations-seed.json";
import { getEconomyMacroSnapshot } from "@/lib/economy";

export interface MacroObservation {
  id: string;
  label: string;
  value: number;
  unit: string;
  period: string;
}

export interface MacroObservationsSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  isSeed: boolean;
  methodologyNote: string;
  observations: MacroObservation[];
}

const seed = macroObs as MacroObservationsSnapshot;

const STRIP_IDS = ["inflation_ccpi", "forex_reserves"] as const;

/** Prefer live economy-macro indicators when present; fall back to seed strip. */
export function getMacroObservationsStrip(): MacroObservationsSnapshot {
  const macro = getEconomyMacroSnapshot();
  const fromMacro = STRIP_IDS.map((id) =>
    macro.indicators.find((indicator) => indicator.id === id),
  ).filter((item): item is NonNullable<typeof item> => item != null);

  if (fromMacro.length > 0) {
    return {
      sourceId: macro.sourceId,
      sourceName: macro.sourceName,
      asOf: macro.asOf,
      isSeed: true,
      methodologyNote: seed.methodologyNote,
      observations: fromMacro.map((indicator) => ({
        id: indicator.id,
        label: indicator.label,
        value: indicator.value,
        unit: indicator.unit,
        period: indicator.period,
      })),
    };
  }

  return {
    ...seed,
    observations: seed.observations.filter((item) =>
      STRIP_IDS.includes(item.id as (typeof STRIP_IDS)[number]),
    ),
  };
}
