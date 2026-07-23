import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getPublicHolidayToday,
  LK_PUBLIC_HOLIDAYS_SOURCE_ID,
} from "@/lib/integrations/holidays";
import { getSourceProvenancePath } from "@/lib/sources";

export async function HolidayTodayStrip() {
  const t = await getTranslations("home");
  const holiday = getPublicHolidayToday();

  if (!holiday) {
    return null;
  }

  const tags: string[] = [];
  if (holiday.public) {
    tags.push(t("holidayTagPublic"));
  }
  if (holiday.bank) {
    tags.push(t("holidayTagBank"));
  }
  if (holiday.mercantile) {
    tags.push(t("holidayTagMercantile"));
  }

  return (
    <section
      className="lk-motion-fade-up rounded-2xl border border-teal-500/20 bg-teal-500/5 px-4 py-3"
      aria-label={t("holidayStripLabel")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-teal-400/80">
            {t("holidayStripTitle")}
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-white">
            {holiday.nameEn}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {t("holidayStripDate", { date: holiday.date })}
            {tags.length > 0 ? ` · ${tags.join(" · ")}` : ""}
          </p>
        </div>
        <Link
          href={getSourceProvenancePath(LK_PUBLIC_HOLIDAYS_SOURCE_ID)}
          className="text-xs text-teal-300 hover:text-teal-200"
        >
          {t("holidayStripSource")}
        </Link>
      </div>
    </section>
  );
}
