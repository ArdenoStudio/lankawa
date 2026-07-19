import { getTranslations } from "next-intl/server";
import { BriefFactLedger } from "@/components/BriefFactLedger";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import { computeFreshnessTier } from "@/lib/freshness";
import { buildMorningBrief } from "@/lib/integrations/brief";
import { buildPulseSnapshot } from "@/lib/pulse";

export async function MorningBrief({ locale }: { locale: string }) {
  const t = await getTranslations("brief");
  const [brief, pulse] = await Promise.all([
    buildMorningBrief(locale),
    buildPulseSnapshot(),
  ]);
  const tier =
    brief.quality === "pass"
      ? computeFreshnessTier(brief.generatedAt, 60)
      : "down";
  const showTranslationNote =
    locale !== "en" && brief.mode !== "fact_ledger" && brief.mode !== "template";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
            {t("eyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{t("title")}</h2>
          <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
        </div>
        <FreshnessBadge tier={tier} />
      </div>

      <article className="lk-card p-5">
        <BriefFactLedger metrics={pulse.metrics} />

        <ul className="space-y-3" role="list">
          {brief.bullets.map((bullet, index) => (
            <li key={`${brief.generatedAt}-${index}`} className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-300" />
              <p className="text-sm leading-6 text-slate-100">{bullet}</p>
            </li>
          ))}
        </ul>

        {showTranslationNote ? (
          <p className="mt-4 rounded-xl border border-teal-400/20 bg-teal-400/10 px-3 py-2 text-xs text-teal-100">
            {t("translationNote")}
          </p>
        ) : null}

        {brief.mode ? (
          <p className="mt-3 text-xs text-slate-500">
            {t("modeLabel", { mode: t(`modes.${brief.mode}`) })}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {brief.topics.slice(0, 5).map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300 ring-1 ring-white/10"
            >
              {topic}
            </span>
          ))}
        </div>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--lk-border)] pt-4 text-xs text-slate-500">
          <span>
            {t("freshness", {
              count: brief.sourceHeadlineCount,
              date: new Date(brief.generatedAt).toLocaleString(),
            })}
          </span>
          <Link
            href={brief.provenancePath}
            className="text-teal-300 hover:text-teal-200"
          >
            {t("viewSource")}
          </Link>
        </footer>
      </article>
    </section>
  );
}
