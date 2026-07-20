const FUEL_REVISION_WINDOW_DAYS = 10;

function utcDayMs(value: Date): number {
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

/** True when the latest CPC fuel revision falls within the last 10 calendar days. */
export function isInFuelRevisionWindow(
  steps: Array<{ recordedAt: string }>,
  now: Date = new Date(),
): boolean {
  if (steps.length === 0) {
    return false;
  }

  const latest = [...steps].sort((a, b) =>
    b.recordedAt.localeCompare(a.recordedAt),
  )[0];
  const recordedMs = Date.parse(latest.recordedAt);
  if (Number.isNaN(recordedMs)) {
    return false;
  }

  const days =
    (utcDayMs(now) - utcDayMs(new Date(recordedMs))) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= FUEL_REVISION_WINDOW_DAYS;
}
