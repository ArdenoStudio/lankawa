/**
 * Human-friendly rendering of ISO timestamps for user-facing labels
 * ("As of 4 Oct 2026, 11:35 pm" instead of "2026-10-04T18:35:30.387766Z").
 * Falls back to the raw string when it cannot be parsed.
 */
export function formatDisplayDate(
  value: string | null | undefined,
  locale = "en",
): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const hasTime = value.includes("T");
  return date.toLocaleString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(hasTime
      ? { hour: "numeric", minute: "2-digit", hour12: true }
      : {}),
    timeZone: "Asia/Colombo",
  });
}
