export const ALERT_PIN_IDS = [
  "fx_move",
  "flood",
  "flood_rising",
  "power",
  "met",
  "landslide",
  "fire",
  "gdacs",
] as const;

export type AlertPinId = (typeof ALERT_PIN_IDS)[number];

export interface AlertSignalContext {
  fxAbsDeltaLkr: number | null;
  fxThresholdLkr: number;
  fxUnusual: boolean;
  fxAnomalyDetail: string | null;
  floodElevated: boolean;
  floodDetail: string | null;
  floodRising: boolean;
  floodRisingDetail: string | null;
  powerAttention: boolean;
  powerDetail: string | null;
  metWarning: boolean;
  metDetail: string | null;
  landslideAttention: boolean;
  landslideDetail: string | null;
  fireAttention: boolean;
  fireDetail: string | null;
  gdacsAttention: boolean;
  gdacsDetail: string | null;
}

export interface FiredAlert {
  id: AlertPinId;
  detail: string;
}

export function isAlertPinId(value: string): value is AlertPinId {
  return (ALERT_PIN_IDS as readonly string[]).includes(value);
}

export function evaluateAlertPins(
  pins: AlertPinId[],
  context: AlertSignalContext,
): FiredAlert[] {
  const fired: FiredAlert[] = [];

  for (const pin of pins) {
    switch (pin) {
      case "fx_move": {
        const byThreshold =
          context.fxAbsDeltaLkr != null &&
          context.fxAbsDeltaLkr >= context.fxThresholdLkr;
        if (byThreshold || context.fxUnusual) {
          fired.push({
            id: pin,
            detail:
              context.fxAnomalyDetail ??
              (context.fxAbsDeltaLkr != null
                ? `USD/LKR moved ${context.fxAbsDeltaLkr.toFixed(2)} LKR (≥ ${context.fxThresholdLkr})`
                : "Unusual FX move"),
          });
        }
        break;
      }
      case "flood": {
        if (context.floodElevated) {
          fired.push({
            id: pin,
            detail: context.floodDetail ?? "Elevated flood station alerts",
          });
        }
        break;
      }
      case "flood_rising": {
        if (context.floodRising) {
          fired.push({
            id: pin,
            detail: context.floodRisingDetail ?? "River level rising quickly",
          });
        }
        break;
      }
      case "power": {
        if (context.powerAttention) {
          fired.push({
            id: pin,
            detail: context.powerDetail ?? "Power schedule/outage attention",
          });
        }
        break;
      }
      case "met": {
        if (context.metWarning) {
          fired.push({
            id: pin,
            detail: context.metDetail ?? "Met Dept weather warning active",
          });
        }
        break;
      }
      case "landslide": {
        if (context.landslideAttention) {
          fired.push({
            id: pin,
            detail:
              context.landslideDetail ?? "Landslide watch/warning districts active",
          });
        }
        break;
      }
      case "fire": {
        if (context.fireAttention) {
          fired.push({
            id: pin,
            detail: context.fireDetail ?? "Active fire detections in Sri Lanka",
          });
        }
        break;
      }
      case "gdacs": {
        if (context.gdacsAttention) {
          fired.push({
            id: pin,
            detail: context.gdacsDetail ?? "Regional GDACS hazard alert",
          });
        }
        break;
      }
      default: {
        const _exhaustive: never = pin;
        void _exhaustive;
      }
    }
  }

  return fired;
}

export function floodIsElevated(
  levels: Array<{ alertLevel: string; count: number }>,
): { elevated: boolean; detail: string | null } {
  const elevated = levels.filter((level) => {
    const key = level.alertLevel.toUpperCase();
    return (
      level.count > 0 &&
      key !== "NORMAL" &&
      key !== "NONE" &&
      key !== "UNKNOWN" &&
      key !== "NO ALERT"
    );
  });

  if (elevated.length === 0) {
    return { elevated: false, detail: null };
  }

  const detail = elevated
    .map((level) => `${level.alertLevel}: ${level.count}`)
    .join(" · ");
  return { elevated: true, detail };
}

export function powerNeedsAttention(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.toLowerCase();
  return (
    normalized.includes("outage") ||
    normalized.includes("scheduled") ||
    normalized.includes("load")
  );
}
