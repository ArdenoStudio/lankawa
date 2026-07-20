/** Parse Atom `?since=` as ISO-8601 datetime or duration (PTnH / PnD). */
export function parseSinceParam(
  value: string | null | undefined,
  now = Date.now(),
): number | null {
  if (!value?.trim()) {
    return null;
  }

  const raw = value.trim();
  const absolute = Date.parse(raw);
  if (!Number.isNaN(absolute)) {
    return absolute;
  }

  const duration = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i.exec(
    raw,
  );
  if (!duration) {
    return null;
  }

  const days = Number(duration[1] ?? 0);
  const hours = Number(duration[2] ?? 0);
  const minutes = Number(duration[3] ?? 0);
  const seconds = Number(duration[4] ?? 0);
  const ms =
    ((days * 24 + hours) * 60 + minutes) * 60_000 + seconds * 1_000;
  if (ms <= 0) {
    return null;
  }
  return now - ms;
}

export function filterHeadlinesSince<
  T extends { publishedAt: string },
>(headlines: T[], sinceMs: number | null): T[] {
  if (sinceMs == null) {
    return headlines;
  }
  return headlines.filter((headline) => {
    const published = Date.parse(headline.publishedAt);
    return !Number.isNaN(published) && published >= sinceMs;
  });
}
