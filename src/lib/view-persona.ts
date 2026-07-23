export type ViewPersona = "citizen" | "markets" | "ops";

export const VIEW_PERSONA_KEY = "lankawa_view_persona";
export const VIEW_PERSONA_EVENT = "lankawa:view-persona";

export const VIEW_PERSONAS: readonly ViewPersona[] = [
  "citizen",
  "markets",
  "ops",
] as const;

/** Lightweight default module href keys per persona (explore / depth rail). */
export const PERSONA_DEFAULTS: Record<
  ViewPersona,
  { homeModules: readonly string[] }
> = {
  citizen: {
    homeModules: [
      "districts",
      "disaster",
      "health",
      "costOfLiving",
      "services",
      "explore",
      "learn",
    ],
  },
  markets: {
    homeModules: [
      "economy",
      "property",
      "costOfLiving",
      "budget",
      "vehicles",
      "food",
      "explore",
    ],
  },
  ops: {
    homeModules: [
      "disaster",
      "status",
      "tenders",
      "sources",
      "assistant",
      "civic",
      "explore",
    ],
  },
};

export function isViewPersona(value: string | null | undefined): value is ViewPersona {
  return (
    value === "citizen" || value === "markets" || value === "ops"
  );
}

export function readViewPersona(storage: Storage): ViewPersona {
  const raw = storage.getItem(VIEW_PERSONA_KEY);
  return isViewPersona(raw) ? raw : "citizen";
}

export function writeViewPersona(storage: Storage, persona: ViewPersona) {
  storage.setItem(VIEW_PERSONA_KEY, persona);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(VIEW_PERSONA_EVENT, { detail: persona }),
    );
  }
}

/** Reorder a list of module keys so persona defaults lead; unknown keys keep relative order. */
export function orderModulesForPersona<T extends { key: string }>(
  modules: readonly T[],
  persona: ViewPersona,
): T[] {
  const preferred = PERSONA_DEFAULTS[persona].homeModules;
  const rank = new Map(preferred.map((key, index) => [key, index]));
  return [...modules].sort((a, b) => {
    const aRank = rank.get(a.key);
    const bRank = rank.get(b.key);
    if (aRank == null && bRank == null) return 0;
    if (aRank == null) return 1;
    if (bRank == null) return -1;
    return aRank - bRank;
  });
}
