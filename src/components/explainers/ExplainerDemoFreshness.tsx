import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FreshnessBadge } from "@/components/FreshnessBadge";

const TIERS = [
  {
    tier: "fresh" as const,
    ring: "ring-emerald-500/30",
    panel: "border-emerald-500/20 bg-emerald-500/5",
  },
  {
    tier: "stale" as const,
    ring: "ring-amber-500/30",
    panel: "border-amber-500/20 bg-amber-500/5",
  },
  {
    tier: "down" as const,
    ring: "ring-rose-500/30",
    panel: "border-rose-500/20 bg-rose-500/5",
  },
] as const;

export async function ExplainerDemoFreshness() {
  const t = await getTranslations("learn.items.freshness.demo");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
        <p className="text-sm text-slate-400">{t("sampleMetric")}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-2xl font-semibold text-white">302.45 LKR</p>
          <FreshnessBadge tier="fresh" />
        </div>
        <p className="mt-3 text-xs text-slate-500">{t("asOf")}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {TIERS.map((item) => (
          <article
            key={item.tier}
            className={`rounded-xl border p-4 ${item.panel}`}
          >
            <FreshnessBadge tier={item.tier} />
            <p className="mt-3 text-sm text-slate-300">
              {t(`tiers.${item.tier}.body`)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {t(`tiers.${item.tier}.action`)}
            </p>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
        {t("statusLinkPrefix")}{" "}
        <Link href="/status" className="text-teal-300 hover:text-teal-200">
          {t("statusLinkLabel")}
        </Link>
        {t("statusLinkSuffix")}
      </div>
    </div>
  );
}
