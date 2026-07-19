import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { buildPulseSnapshot } from "@/lib/pulse";
import { formatAdapter, formatCadence } from "@/lib/source-display";
import { getCategoryLabel, getSource, SOURCES } from "@/lib/sources";

export function generateStaticParams() {
  return SOURCES.map((source) => ({ id: source.id }));
}

export default async function SourceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const source = getSource(id);

  if (!source) {
    notFound();
  }

  const t = await getTranslations("sources");
  const snapshot = await buildPulseSnapshot();
  const health = snapshot.sources.find((item) => item.id === source.id);
  const relatedMetrics = snapshot.metrics.filter(
    (metric) => metric.sourceId === source.id,
  );

  const categories = {
    economy: t("categories.economy"),
    disaster: t("categories.disaster"),
    energy: t("categories.energy"),
    environment: t("categories.environment"),
    health: t("categories.health"),
    civic: t("categories.civic"),
    transport: t("categories.transport"),
    sports: t("categories.sports"),
  } satisfies Record<(typeof source)["category"], string>;

  const adapters = {
    api: t("adapters.api"),
    scrape: t("adapters.scrape"),
    partner: t("adapters.partner"),
  };

  return (
    <div className="space-y-6">
      <Link href="/sources" className="text-sm text-teal-300 hover:text-teal-200">
        {t("back")}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">{source.name}</h1>
          <p className="mt-2 text-slate-400">
            {getCategoryLabel(source.category, categories)}
          </p>
        </div>
        {health ? <FreshnessBadge tier={health.tier} /> : null}
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-semibold text-white">{t("overview")}</h2>
        <p className="mt-2 text-slate-300">{source.description}</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-semibold text-white">{t("methodology")}</h2>
        <p className="mt-2 text-slate-300">{source.methodology}</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-semibold text-white">{t("freshness")}</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">{t("cadence")}</dt>
            <dd className="font-medium text-slate-200">
              {formatCadence(source.cadenceMinutes)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("adapter")}</dt>
            <dd className="font-medium text-slate-200">
              {formatAdapter(source.adapter, adapters)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("lastChecked")}</dt>
            <dd className="font-medium text-slate-200">
              {health?.lastCheckedAt
                ? new Date(health.lastCheckedAt).toLocaleString()
                : t("unknownDate")}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("lastSuccess")}</dt>
            <dd className="font-medium text-slate-200">
              {health?.lastSuccessAt
                ? new Date(health.lastSuccessAt).toLocaleString()
                : t("unknownDate")}
            </dd>
          </div>
        </dl>
        {health?.error ? (
          <p className="mt-4 text-sm text-rose-300">{health.error}</p>
        ) : null}
      </section>

      {relatedMetrics.length > 0 ? (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">{t("metrics")}</h2>
          <ul className="mt-4 space-y-3">
            {relatedMetrics.map((metric) => (
              <li
                key={metric.id}
                className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 first:border-t-0 first:pt-0"
              >
                <div>
                  <p className="font-medium text-white">{metric.label}</p>
                  <p className="text-sm text-slate-400">
                    {metric.value}
                    {metric.unit ? ` ${metric.unit}` : ""}
                  </p>
                </div>
                <FreshnessBadge tier={metric.tier} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
