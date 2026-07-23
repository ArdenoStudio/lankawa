import seed from "@/data/lk-holidays-2026.json";
import { getSource } from "../sources";

export const LK_PUBLIC_HOLIDAYS_SOURCE_ID = "lk_public_holidays" as const;

const COLOMBO_TZ = "Asia/Colombo";

export type LkHoliday = {
  date: string;
  nameEn: string;
  public: boolean;
  bank: boolean;
  mercantile: boolean;
};

export type LkHolidaySnapshot = {
  year: number;
  source: string;
  sourceUrl: string;
  asOf: string;
  sourceId: typeof LK_PUBLIC_HOLIDAYS_SOURCE_ID;
  holidays: LkHoliday[];
};

type SeedShape = {
  year: number;
  source: string;
  sourceUrl: string;
  asOf: string;
  holidays: LkHoliday[];
};

const SEED = seed as SeedShape;

/** YYYY-MM-DD in Asia/Colombo. */
export function colomboDateKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: COLOMBO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function getHolidaySnapshot(year?: number): LkHolidaySnapshot | null {
  getSource(LK_PUBLIC_HOLIDAYS_SOURCE_ID);

  if (year != null && year !== SEED.year) {
    return null;
  }

  return {
    year: SEED.year,
    source: SEED.source,
    sourceUrl: SEED.sourceUrl,
    asOf: SEED.asOf,
    sourceId: LK_PUBLIC_HOLIDAYS_SOURCE_ID,
    holidays: SEED.holidays.map((holiday) => ({ ...holiday })),
  };
}

export function getHolidayForDate(isoDate: string): LkHoliday | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return null;
  }
  const snapshot = getHolidaySnapshot(Number(isoDate.slice(0, 4)));
  if (!snapshot) {
    return null;
  }
  return snapshot.holidays.find((holiday) => holiday.date === isoDate) ?? null;
}

export function isPublicHolidayToday(now: Date = new Date()): boolean {
  const holiday = getHolidayForDate(colomboDateKey(now));
  return holiday?.public === true;
}

export function getPublicHolidayToday(
  now: Date = new Date(),
): LkHoliday | null {
  const holiday = getHolidayForDate(colomboDateKey(now));
  if (!holiday?.public) {
    return null;
  }
  return holiday;
}
