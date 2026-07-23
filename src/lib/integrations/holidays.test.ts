import assert from "node:assert/strict";
import {
  colomboDateKey,
  getHolidayForDate,
  getHolidaySnapshot,
  getPublicHolidayToday,
  isPublicHolidayToday,
  LK_PUBLIC_HOLIDAYS_SOURCE_ID,
} from "./holidays";

const snapshot = getHolidaySnapshot();
assert.ok(snapshot);
assert.equal(snapshot.year, 2026);
assert.equal(snapshot.sourceId, LK_PUBLIC_HOLIDAYS_SOURCE_ID);
assert.equal(snapshot.holidays.length, 25);

const independence = getHolidayForDate("2026-02-04");
assert.ok(independence);
assert.equal(independence.nameEn, "Independence Day");
assert.equal(independence.public, true);
assert.equal(independence.bank, true);
assert.equal(independence.mercantile, true);

const vesakMayDay = getHolidayForDate("2026-05-01");
assert.ok(vesakMayDay);
assert.equal(vesakMayDay.nameEn, "Vesak Full Moon Poya Day / May Day");
assert.equal(vesakMayDay.mercantile, true);

const christmas = getHolidayForDate("2026-12-25");
assert.ok(christmas);
assert.equal(christmas.nameEn, "Christmas Day");

assert.equal(getHolidayForDate("2026-07-04"), null);
assert.equal(getHolidayForDate("not-a-date"), null);
assert.equal(getHolidaySnapshot(2025), null);

const poya = getHolidayForDate("2026-01-03");
assert.ok(poya);
assert.equal(poya.mercantile, false);

const key = colomboDateKey(new Date("2026-02-04T12:00:00+05:30"));
assert.equal(key, "2026-02-04");
assert.equal(
  isPublicHolidayToday(new Date("2026-02-04T08:00:00+05:30")),
  true,
);
assert.equal(
  isPublicHolidayToday(new Date("2026-02-05T08:00:00+05:30")),
  false,
);

const todayHoliday = getPublicHolidayToday(
  new Date("2026-02-04T08:00:00+05:30"),
);
assert.ok(todayHoliday);
assert.equal(todayHoliday.nameEn, "Independence Day");

assert.equal(LK_PUBLIC_HOLIDAYS_SOURCE_ID, "lk_public_holidays");

console.log("holidays.test.ts: ok");
