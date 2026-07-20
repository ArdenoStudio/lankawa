export const WEB_PUSH_PREFS_KEY = "lankawa_web_push_prefs";

export interface WebPushPrefs {
  /** Browser Notification permission last requested (not server subscription). */
  permissionAskedAt: string | null;
  /** Local quiet hours — suppress toast/push UI 22:00–06:00 local by default. */
  quietHoursEnabled: boolean;
  quietStartHour: number;
  quietEndHour: number;
}

export const DEFAULT_WEB_PUSH_PREFS: WebPushPrefs = {
  permissionAskedAt: null,
  quietHoursEnabled: true,
  quietStartHour: 22,
  quietEndHour: 6,
};

export function parseWebPushPrefs(raw: string | null): WebPushPrefs {
  if (!raw) {
    return { ...DEFAULT_WEB_PUSH_PREFS };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<WebPushPrefs>;
    return {
      permissionAskedAt:
        typeof parsed.permissionAskedAt === "string"
          ? parsed.permissionAskedAt
          : null,
      quietHoursEnabled:
        typeof parsed.quietHoursEnabled === "boolean"
          ? parsed.quietHoursEnabled
          : DEFAULT_WEB_PUSH_PREFS.quietHoursEnabled,
      quietStartHour:
        typeof parsed.quietStartHour === "number"
          ? parsed.quietStartHour
          : DEFAULT_WEB_PUSH_PREFS.quietStartHour,
      quietEndHour:
        typeof parsed.quietEndHour === "number"
          ? parsed.quietEndHour
          : DEFAULT_WEB_PUSH_PREFS.quietEndHour,
    };
  } catch {
    return { ...DEFAULT_WEB_PUSH_PREFS };
  }
}

/** True when local hour is inside quiet window (handles wrap past midnight). */
export function isInQuietHours(
  hour: number,
  startHour: number,
  endHour: number,
): boolean {
  if (!Number.isFinite(hour)) {
    return false;
  }
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  const start = ((Math.floor(startHour) % 24) + 24) % 24;
  const end = ((Math.floor(endHour) % 24) + 24) % 24;
  if (start === end) {
    return false;
  }
  if (start < end) {
    return h >= start && h < end;
  }
  return h >= start || h < end;
}

export function readWebPushPrefs(storage: Storage): WebPushPrefs {
  return parseWebPushPrefs(storage.getItem(WEB_PUSH_PREFS_KEY));
}

export function writeWebPushPrefs(storage: Storage, prefs: WebPushPrefs) {
  storage.setItem(WEB_PUSH_PREFS_KEY, JSON.stringify(prefs));
}
