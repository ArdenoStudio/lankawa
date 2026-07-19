import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { buildPulseSnapshot } from "@/lib/pulse";
import { formatAdapter, formatCadence } from "@/lib/source-display";
import { getCategoryLabel, SOURCES } from "@/lib/sources";

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("sources");
  const snapshot = await buildPulseSnapshot();
  const healthById = new Map(snapshot.sources.map((source) => [source.id, source]));

  const categories = {
    economy: t("categories.economy"),
    disaster: t("categories.disaster"),
    energy: t("categories.energy"),
    environment: t("categories.environment"),
    health: t("categories.health"),
    civic: t("categories.civic"),
    transport: t("categories.transport"),
    sports: t("categories.sports"),
  } satisfies Record<
    (typeof SOURCES)[number]["category"],
    string
  >;

  const adapters = {
    api: t("adapters.api"),
    scrape: t("adapters.scrape"),
    partner: t("adapters.partner"),
    seed: t("adapters.seed"),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4">
        {SOURCES.map((source) => {
          const health = healthById.get(source.id);
          return (
            <article
              key={source.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/sources/${source.id}`}
                    className="text-lg font-semibold text-white hover:text-teal-200"
                  >
                    {source.name}
                  </Link>
                  <p className="mt-1 text-sm text-slate-400">
                    {getCategoryLabel(source.category, categories)}
                  </p>
                </div>
                {health ? <FreshnessBadge tier={health.tier} /> : null}
              </div>

              <p className="mt-3 text-sm text-slate-300">{source.description}</p>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
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
                  <dt className="text-slate-500">{t("lastUpdated")}</dt>
                  <dd className="font-medium text-slate-200">
                    {health?.lastSuccessAt
                      ? new Date(health.lastSuccessAt).toLocaleString()
                      : t("unknownDate")}
                  </dd>
                </div>
              </dl>

              <Link
                href={`/sources/${source.id}`}
                className="mt-4 inline-block text-sm text-teal-300 hover:text-teal-200"
              >
                {t("viewDetails")}
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
