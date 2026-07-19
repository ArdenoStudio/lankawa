import {
  isAlertPinId,
  type AlertPinId,
} from "@/lib/alert-pins";

export const HOME_DISTRICT_KEY = "lankawa_home_district";
export const ALERT_PINS_KEY = "lankawa_alert_pins";

export function readHomeDistrict(storage: Storage): string | null {
  const slug = storage.getItem(HOME_DISTRICT_KEY);
  return slug && slug.trim() ? slug.trim() : null;
}

export function writeHomeDistrict(storage: Storage, slug: string | null) {
  if (!slug) {
    storage.removeItem(HOME_DISTRICT_KEY);
    return;
  }
  storage.setItem(HOME_DISTRICT_KEY, slug);
}

export function readAlertPins(storage: Storage): AlertPinId[] {
  const raw = storage.getItem(ALERT_PINS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is AlertPinId =>
        typeof item === "string" && isAlertPinId(item),
    );
  } catch {
    return [];
  }
}

export function writeAlertPins(storage: Storage, pins: AlertPinId[]) {
  const unique = [...new Set(pins.filter(isAlertPinId))];
  storage.setItem(ALERT_PINS_KEY, JSON.stringify(unique));
}
