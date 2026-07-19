export type RetentionEventName =
  | "home_view"
  | "home_return_d1"
  | "home_return_d7"
  | "today_metric_open"
  | "brief_view";

export interface RetentionEvent {
  name: RetentionEventName;
  at: string;
  locale?: string;
  path?: string;
  meta?: Record<string, string | number | boolean | null>;
}

const FIRST_SEEN_KEY = "lankawa_first_seen";
const LAST_RETURN_KEY = "lankawa_last_return_event";

export function daysBetween(fromIso: string, toMs = Date.now()): number {
  const from = Date.parse(fromIso);
  if (Number.isNaN(from)) {
    return 0;
  }
  return Math.floor((toMs - from) / 86_400_000);
}

export function resolveReturnEvent(
  firstSeenIso: string,
  now = Date.now(),
): RetentionEventName | null {
  const days = daysBetween(firstSeenIso, now);
  if (days >= 7) {
    return "home_return_d7";
  }
  if (days >= 1) {
    return "home_return_d1";
  }
  return null;
}

export function readBrowserRetentionState(storage: Storage): {
  firstSeen: string;
  lastReturnEvent: string | null;
} {
  const existing = storage.getItem(FIRST_SEEN_KEY);
  if (existing) {
    return {
      firstSeen: existing,
      lastReturnEvent: storage.getItem(LAST_RETURN_KEY),
    };
  }

  const firstSeen = new Date().toISOString();
  storage.setItem(FIRST_SEEN_KEY, firstSeen);
  return { firstSeen, lastReturnEvent: null };
}

export function markReturnEvent(storage: Storage, eventName: RetentionEventName) {
  storage.setItem(LAST_RETURN_KEY, eventName);
}
