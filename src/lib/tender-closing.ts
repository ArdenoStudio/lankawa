import type { TenderNotice } from "@/lib/types";

export const DEFAULT_TENDER_CLOSING_DAYS = 7;

/** Days until closing date (date-only). Negative when already closed. */
export function daysUntilTenderClose(
  closingDate: string,
  now = new Date(),
): number | null {
  const timestamp = Date.parse(closingDate.replace(" ", "T"));
  if (Number.isNaN(timestamp)) {
    return null;
  }
  const startOfToday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const closeDay = new Date(timestamp);
  const startOfClose = Date.UTC(
    closeDay.getUTCFullYear(),
    closeDay.getUTCMonth(),
    closeDay.getUTCDate(),
  );
  return Math.round((startOfClose - startOfToday) / 86_400_000);
}

export function filterTendersClosingWithin(
  notices: TenderNotice[],
  withinDays = DEFAULT_TENDER_CLOSING_DAYS,
  now = new Date(),
): TenderNotice[] {
  return notices
    .filter((notice) => {
      const days = daysUntilTenderClose(notice.closingDate, now);
      return days != null && days >= 0 && days <= withinDays;
    })
    .sort((a, b) => a.closingDate.localeCompare(b.closingDate));
}

export function summarizeTendersClosingSoon(
  notices: TenderNotice[],
  withinDays = DEFAULT_TENDER_CLOSING_DAYS,
  now = new Date(),
): { count: number; detail: string | null } {
  const closing = filterTendersClosingWithin(notices, withinDays, now);
  if (closing.length === 0) {
    return { count: 0, detail: null };
  }
  const soonest = closing[0];
  return {
    count: closing.length,
    detail: `${closing.length} tender${closing.length === 1 ? "" : "s"} close within ${withinDays}d · soonest ${soonest.closingDate}`,
  };
}
