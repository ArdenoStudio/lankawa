export const ALERT_PIN_IDS = [
  "fx_move",
  "flood",
  "power",
  "met",
] as const;

export type AlertPinId = (typeof ALERT_PIN_IDS)[number];

export interface AlertSignalContext {
  fxAbsDeltaLkr: number | null;
  fxThresholdLkr: number;
  floodElevated: boolean;
  floodDetail: string | null;
  powerAttention: boolean;
  powerDetail: string | null;
  metWarning: boolean;
  metDetail: string | null;
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
        if (
          context.fxAbsDeltaLkr != null &&
          context.fxAbsDeltaLkr >= context.fxThresholdLkr
        ) {
          fired.push({
            id: pin,
            detail: `USD/LKR moved ${context.fxAbsDeltaLkr.toFixed(2)} LKR (≥ ${context.fxThresholdLkr})`,
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
