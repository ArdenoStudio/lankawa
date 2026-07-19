import { getTranslations } from "next-intl/server";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import { fetchSriLankaCricketMatch } from "@/lib/integrations/cricket";

export async function CricketCard() {
  const match = await fetchSriLankaCricketMatch();
  if (!match) {
    return null;
  }

  const t = await getTranslations("cricket");
  const startsAt = match.startsAt
    ? new Date(match.startsAt).toLocaleString()
    : t("timeUnavailable");

  return (
    <section className="lk-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
            {t("eyebrow")}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">{t("title")}</h2>
          <p className="mt-2 text-sm text-slate-400">{t("subtitle")}</p>
        </div>
        <FreshnessBadge tier="fresh" />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-teal-400/15 px-2.5 py-1 text-xs font-medium text-teal-200 ring-1 ring-teal-400/30">
            {match.status === "live" ? t("live") : t("upcoming")}
          </span>
          {match.competition ? (
            <span className="text-xs text-slate-500">{match.competition}</span>
          ) : null}
        </div>

        <h3 className="mt-3 text-lg font-semibold text-white">{match.name}</h3>
        <p className="mt-2 text-sm text-slate-400">
          {t("startsAt", { date: startsAt })}
        </p>
        {match.venue ? (
          <p className="mt-1 text-sm text-slate-400">
            {t("venue", { venue: match.venue })}
          </p>
        ) : null}
        {match.score ? (
          <p className="mt-3 rounded-xl bg-slate-950/40 px-3 py-2 text-sm font-medium text-teal-100">
            {match.score}
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">{match.statusText}</p>
        )}
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--lk-border)] pt-4 text-xs text-slate-500">
        <span>{t("provenance")}</span>
        <Link
          href={match.provenancePath}
          className="text-teal-300 hover:text-teal-200"
        >
          {t("viewSource")}
        </Link>
      </footer>
    </section>
  );
}
