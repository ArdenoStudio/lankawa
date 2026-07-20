import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  briefDateKey,
  isBriefDateKey,
  loadArchivedBrief,
} from "@/lib/integrations/brief";

export const dynamic = "force-dynamic";

export default async function ArchivedBriefPage({
  params,
}: {
  params: Promise<{ locale: string; date: string }>;
}) {
  const { locale, date } = await params;
  setRequestLocale(locale);

  if (!isBriefDateKey(date)) {
    notFound();
  }

  const t = await getTranslations("briefSubscribe.archive");
  const brief = await loadArchivedBrief(date, locale);
  const today = briefDateKey();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white">
          {t("title", { date })}
        </h1>
        <p className="mt-2 text-slate-400">{t("subtitle")}</p>
      </div>

      {brief ? (
        <article className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <ul className="space-y-3" role="list">
            {brief.bullets.map((bullet, index) => (
              <li key={`${brief.generatedAt}-${index}`} className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-neutral-300" />
                <p className="text-sm leading-6 text-slate-100">{bullet}</p>
              </li>
            ))}
          </ul>
          {brief.topics.length > 0 ? (
            <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
              {brief.topics.slice(0, 6).map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300 ring-1 ring-white/10"
                >
                  {topic}
                </span>
              ))}
            </div>
          ) : null}
          <p className="text-xs text-slate-500">
            {t("generated", {
              date: new Date(brief.generatedAt).toLocaleString(),
            })}
          </p>
        </article>
      ) : (
        <div className="space-y-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5">
          <p className="text-sm text-slate-300">{t("emptyTitle")}</p>
          <p className="text-sm text-slate-500">{t("emptyBody")}</p>
          {date === today ? (
            <Link
              href="/"
              className="inline-block text-sm text-teal-300 hover:text-teal-200"
            >
              {t("todayLink")}
            </Link>
          ) : null}
        </div>
      )}

      <p className="text-sm">
        <Link href="/" className="text-teal-300 hover:text-teal-200">
          {t("homeLink")}
        </Link>
      </p>
    </div>
  );
}
