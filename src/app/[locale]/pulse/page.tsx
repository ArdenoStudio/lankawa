import { getTranslations, setRequestLocale } from "next-intl/server";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import { buildPulseSnapshot } from "@/lib/pulse";
import { getRipples } from "@/lib/ripples";
import { getSourceProvenancePath } from "@/lib/sources";
import type { FreshnessTier } from "@/lib/types";

export const dynamic = "force-dynamic";

const tierOrder: FreshnessTier[] = ["fresh", "stale", "down", "unknown", "seed"];

function formatLkr(n: number): string {
  const abs = Math.abs(n);
  const rounded = abs >= 100 ? Math.round(n) : Math.round(n * 10) / 10;
  return `LKR ${rounded.toLocaleString("en-LK")}`;
}

export default async function PulsePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pulse");

  const [snapshot, ripples] = await Promise.all([
    buildPulseSnapshot(),
    getRipples(),
  ]);

  const sources = [...snapshot.sources].sort(
    (a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier),
  );

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-teal-300">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
        <p className="mt-2 text-sm text-slate-500">
          {t("generatedAt", { date: snapshot.generatedAt })}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("metricsTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.metrics.map((metric) => (
            <article
              key={metric.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="flex items-center justify-between gap-2 text-sm text-slate-400">
                <span>{metric.label}</span>
                <FreshnessBadge tier={metric.tier} />
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {metric.value}
                {metric.unit ? (
                  <span className="ml-1 text-base font-normal text-slate-400">
                    {metric.unit}
                  </span>
                ) : null}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {metric.observedAt
                  ? t("observedAt", { date: metric.observedAt })
                  : t("observedUnknown")}{" "}
                ·{" "}
                <Link
                  href={getSourceProvenancePath(metric.sourceId)}
                  className="text-teal-300 hover:text-teal-200"
                >
                  {t("sourceLink")}
                </Link>
              </p>
              {metric.note ? (
                <p className="mt-1 text-xs text-slate-500">{metric.note}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {ripples.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {t("ripplesTitle")}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              {t("ripplesSubtitle")}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {ripples.map((ripple) =>
              ripple.kind === "fuel" ? (
                <article
                  key="fuel"
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <p className="text-sm font-medium text-white">
                    {t("rippleFuelTitle", { fuel: ripple.fuelLabel })}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    {t("rippleFuelBody", {
                      fuel: ripple.fuelLabel,
                      direction:
                        ripple.direction === "up"
                          ? t("directionUp")
                          : ripple.direction === "down"
                            ? t("directionDown")
                            : t("directionFlat"),
                      delta: formatLkr(ripple.deltaLkr),
                      pct: Math.abs(ripple.deltaPct).toFixed(1),
                      price: formatLkr(ripple.priceLkr),
                      date: ripple.recordedAt,
                    })}
                  </p>
                  <p className="mt-2 text-sm text-teal-200">
                    {t("rippleFuelImpact", {
                      impact: formatLkr(ripple.monthlyImpactLkr),
                      direction:
                        ripple.monthlyImpactLkr > 0
                          ? t("directionMore")
                          : ripple.monthlyImpactLkr < 0
                            ? t("directionLess")
                            : t("directionFlat"),
                    })}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {t("ripplesEstimateNote")}
                  </p>
                </article>
              ) : (
                <article
                  key="fx"
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <p className="text-sm font-medium text-white">
                    {t("rippleFxTitle")}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    {t("rippleFxBody", {
                      sell: ripple.sellRate.toFixed(2),
                      buy: ripple.buyRate ? ripple.buyRate.toFixed(2) : "—",
                    })}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {ripple.observedAt
                      ? t("observedAt", { date: ripple.observedAt })
                      : t("observedUnknown")}
                  </p>
                </article>
              ),
            )}
          </div>
        </section>
      ) : null}

      {snapshot.flood.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            {t("floodTitle")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {snapshot.flood.map((alert, i) => (
              <article
                key={`${alert.alertLevel}-${i}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <p className="text-sm font-medium text-white">
                  {alert.alertLevel}
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {alert.count}
                </p>
                {alert.stations.length > 0 ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {alert.stations.slice(0, 6).join(", ")}
                    {alert.stations.length > 6 ? "…" : ""}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {t("sourcesTitle")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            {t("sourcesSubtitle")}
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">{t("sourceCol")}</th>
                <th className="px-4 py-3 font-medium">{t("tierCol")}</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  {t("checkedCol")}
                </th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  {t("noteCol")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr
                  key={source.id}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={getSourceProvenancePath(source.id)}
                      className="text-white hover:text-teal-200"
                    >
                      {source.name}
                    </Link>
                    <p className="text-xs text-slate-500">{source.category}</p>
                  </td>
                  <td className="px-4 py-3">
                    <FreshnessBadge tier={source.tier} />
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-slate-500 sm:table-cell">
                    {source.lastCheckedAt}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-slate-500 md:table-cell">
                    {source.error ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
