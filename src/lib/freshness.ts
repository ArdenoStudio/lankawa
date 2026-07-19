import type { FreshnessTier } from "./types";

export function computeFreshnessTier(
  observedAt: string | null,
  cadenceMinutes: number,
  now = Date.now(),
): FreshnessTier {
  if (!observedAt) {
    return "unknown";
  }

  const observedMs = new Date(observedAt).getTime();
  if (Number.isNaN(observedMs)) {
    return "unknown";
  }

  const ageMinutes = (now - observedMs) / 60_000;
  const freshLimit = cadenceMinutes;
  const staleLimit = cadenceMinutes * 3;

  if (ageMinutes <= freshLimit) {
    return "fresh";
  }
  if (ageMinutes <= staleLimit) {
    return "stale";
  }
  return "down";
}

export function tierLabel(tier: FreshnessTier): string {
  switch (tier) {
    case "fresh":
      return "Fresh";
    case "stale":
      return "Stale";
    case "down":
      return "Down";
    case "unknown":
      return "Unknown";
    default: {
      const exhaustive: never = tier;
      return exhaustive;
    }
  }
}
