import { getTranslations } from "next-intl/server";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import {
  buildNewsPulseMetric,
  fetchNewsPulse,
  SL_NEWS_FEEDS,
} from "@/lib/integrations/news";
import { clusterHeadlines } from "@/lib/integrations/news-cluster";

function sourceLabel(
  sourceId: string,
  labels: Record<string, string>,
): string {
  const feed = SL_NEWS_FEEDS.find((item) => item.id === sourceId);
  return labels[sourceId] ?? feed?.name ?? sourceId;
}

export async function NewsPulse({ headlineLimit = 5 }: { headlineLimit?: number }) {
  const t = await getTranslations("news");

  let pulse;
  try {
    pulse = await fetchNewsPulse();
  } catch {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{t("title")}</h2>
          <p className="mt-2 text-slate-400">{t("subtitle")}</p>
        </div>
        <p className="lk-card p-5 text-sm text-slate-400">{t("noHeadlines")}</p>
      </section>
    );
  }

  const { metric } = buildNewsPulseMetric(new Date().toISOString(), pulse);
  const clusters = clusterHeadlines(pulse.headlines, 0.35)
    .filter((cluster) => cluster.headlines.length >= 2)
    .slice(0, 4);
  const clusteredUrls = new Set(
    clusters.flatMap((cluster) => cluster.headlines.map((item) => item.url)),
  );
  const headlines = pulse.headlines
    .filter((headline) => !clusteredUrls.has(headline.url))
    .slice(0, headlineLimit);
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

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{t("title")}</h2>
          <p className="mt-2 text-slate-400">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/feed.xml"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/10"
          >
            {t("feed")}
          </a>
          <Link href="/sources/news_rss" className="lk-btn-primary">
            {t("viewAll")}
          </Link>
        </div>
      </div>

      {clusters.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {clusters.map((cluster) => {
            const outlets = new Set(cluster.headlines.map((item) => item.source));
            const lead = cluster.headlines[0];
            return (
              <article
                key={`${cluster.topic}-${lead?.url ?? cluster.score}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("clusterLabel")}
                </p>
                <h3 className="mt-2 text-sm font-medium text-white">
                  {lead?.title ?? cluster.topic}
                </h3>
                <p className="mt-2 text-xs text-slate-500">
                  {t("clusterMeta", {
                    count: cluster.headlines.length,
                    outlets: outlets.size,
                  })}
                </p>
              </article>
            );
          })}
        </div>
      ) : null}

      <article className="lk-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            {t("headlineCount", { count: pulse.headlines.length })}
          </p>
          <FreshnessBadge tier={metric.tier} />
        </div>

        <ul className="space-y-3" role="list">
          {(headlines.length > 0
            ? headlines
            : pulse.headlines.slice(0, headlineLimit)
          ).map((headline, index) => (
            <li key={`${headline.url}-${index}`}>
              <Link
                href="/sources/news_rss"
                className="group block rounded-lg border border-transparent px-3 py-2 transition hover:border-[var(--lk-border)] hover:bg-[var(--lk-surface)]/60"
              >
                <p className="text-sm font-medium text-white group-hover:text-teal-100">
                  {headline.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {sourceLabel(headline.source, sourceLabels)}
                  {headline.publishedAt
                    ? ` · ${new Date(headline.publishedAt).toLocaleString()}`
                    : null}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--lk-border)] pt-4 text-xs text-slate-500">
          <span>{t("provenance")}</span>
          <Link
            href={pulse.provenancePath}
            className="text-teal-300 hover:text-teal-200"
          >
            {t("viewSource")}
          </Link>
        </footer>
      </article>
    </section>
  );
}
