import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { fetchNewsPulse, SL_NEWS_FEEDS } from "@/lib/integrations/news";
import { getClusterById } from "@/lib/integrations/news-cluster";
import { safeHttpUrl } from "@/lib/safe-url";

function sourceLabel(
  sourceId: string,
  labels: Record<string, string>,
): string {
  const feed = SL_NEWS_FEEDS.find((item) => item.id === sourceId);
  return labels[sourceId] ?? feed?.name ?? sourceId;
}

export default async function NewsClusterDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");

  let pulse;
  try {
    pulse = await fetchNewsPulse();
  } catch {
    notFound();
  }

  const cluster = getClusterById(id, pulse.headlines, 0.35);
  if (!cluster || cluster.headlines.length === 0) {
    notFound();
  }

  const sourceLabels = {
    daily_mirror: t("sourceMirror"),
    ada_derana: t("sourceAda"),
    lankadeepa: t("sourceLankadeepa"),
    tamil_guardian: t("sourceTamilGuardian"),
    economynext: t("sourceEconomyNext"),
    newswire: t("sourceNewswire"),
    island: t("sourceIsland"),
    lbo: t("sourceLbo"),
    ada_derana_biz: t("sourceAdaBiz"),
    roar: t("sourceRoar"),
    dmc_rss: t("sourceDmc"),
  };

  const outlets = new Set(cluster.headlines.map((item) => item.source));
  const lead = cluster.headlines[0];
  const publishedTimes = cluster.headlines
    .map((item) => Date.parse(item.publishedAt))
    .filter((value) => !Number.isNaN(value));
  const firstSeen =
    publishedTimes.length > 0
      ? new Date(Math.min(...publishedTimes)).toLocaleString(locale)
      : null;
  const lastSeen =
    publishedTimes.length > 0
      ? new Date(Math.max(...publishedTimes)).toLocaleString(locale)
      : null;

  return (
    <div className="space-y-6">
      <Link href="/news" className="text-sm text-slate-400 hover:text-white">
        ← {t("backToNews")}
      </Link>

      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
          {t("clusterLabel")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          {lead?.title ?? cluster.topic}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {t("clusterMeta", {
            count: cluster.headlines.length,
            outlets: outlets.size,
          })}
        </p>
        {firstSeen && lastSeen ? (
          <p className="mt-2 text-xs text-slate-500">
            {t("clusterWindow", { first: firstSeen, last: lastSeen })}
          </p>
        ) : null}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">
          {t("clusterMembersTitle")}
        </h2>
        <ul className="space-y-3" role="list">
          {cluster.headlines.map((headline, index) => {
            const href = safeHttpUrl(headline.url);
            const meta = (
              <p className="mt-1 text-xs text-slate-500">
                {sourceLabel(headline.source, sourceLabels)}
                {headline.publishedAt
                  ? ` · ${new Date(headline.publishedAt).toLocaleString(locale)}`
                  : null}
              </p>
            );
            return (
              <li key={`${headline.url}-${index}`}>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/25 hover:bg-white/[0.05]"
                  >
                    <p className="text-sm font-medium text-white group-hover:text-slate-100">
                      {headline.title}
                    </p>
                    {meta}
                  </a>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="text-sm font-medium text-white">
                      {headline.title}
                    </p>
                    {meta}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-slate-500">
        <span>{t("provenance")}</span>
        <Link
          href={pulse.provenancePath}
          className="text-slate-300 hover:text-white"
        >
          {t("viewSource")}
        </Link>
      </footer>
    </div>
  );
}
