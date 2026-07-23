import { getTranslations, setRequestLocale } from "next-intl/server";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { NewsTopicRails } from "@/components/NewsTopicRails";
import { Link } from "@/i18n/navigation";
import {
  buildNewsPulseMetric,
  fetchNewsPulse,
  SL_NEWS_FEEDS,
} from "@/lib/integrations/news";
import { clusterHeadlines } from "@/lib/integrations/news-cluster";
import { safeHttpUrl } from "@/lib/safe-url";

function sourceLabel(
  sourceId: string,
  labels: Record<string, string>,
): string {
  const feed = SL_NEWS_FEEDS.find((item) => item.id === sourceId);
  return labels[sourceId] ?? feed?.name ?? sourceId;
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");

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

  let pulse;
  try {
    pulse = await fetchNewsPulse();
  } catch {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">{t("pageTitle")}</h1>
          <p className="mt-2 max-w-2xl text-slate-400">{t("pageSubtitle")}</p>
        </div>
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
          {t("noHeadlines")}
        </p>
      </div>
    );
  }

  const { metric } = buildNewsPulseMetric(new Date().toISOString(), pulse);
  const clusters = clusterHeadlines(pulse.headlines, 0.35).filter(
    (cluster) => cluster.headlines.length >= 2,
  );
  const topicRails = clusters.slice(0, 8).map((cluster) => ({
    id: cluster.id,
    topic: cluster.topic,
    headlineCount: cluster.headlines.length,
    outletCount: new Set(cluster.headlines.map((item) => item.source)).size,
    leadTitle: cluster.headlines[0]?.title ?? cluster.topic,
  }));
  const clusteredUrls = new Set(
    clusters.flatMap((cluster) => cluster.headlines.map((item) => item.url)),
  );
  const standaloneHeadlines = pulse.headlines.filter(
    (headline) => !clusteredUrls.has(headline.url),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">{t("pageTitle")}</h1>
          <p className="mt-2 max-w-2xl text-slate-400">{t("pageSubtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FreshnessBadge tier={metric.tier} />
          <a
            href="/feed.xml"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/10"
          >
            {t("feed")}
          </a>
          <a
            href="/feed.xml?since=PT6H"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/10"
          >
            {t("feedDelta")}
          </a>
        </div>
      </div>

      <NewsTopicRails topics={topicRails} locale={locale} />

      {clusters.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {t("clustersTitle")}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{t("clustersSubtitle")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {clusters.map((cluster) => {
              const outlets = new Set(
                cluster.headlines.map((item) => item.source),
              );
              const lead = cluster.headlines[0];
              return (
                <Link
                  key={cluster.id}
                  href={`/news/clusters/${cluster.id}`}
                  className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.05]"
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
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {t("headlinesTitle")}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {t("headlineCount", { count: pulse.headlines.length })}
            </p>
          </div>
        </div>

        <ul className="space-y-3" role="list">
          {(standaloneHeadlines.length > 0
            ? standaloneHeadlines
            : pulse.headlines
          ).map((headline, index) => {
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

      {pulse.feedHealth.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {t("feedHealthTitle")}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{t("feedHealthSubtitle")}</p>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2" role="list">
            {pulse.feedHealth.map((feed) => (
              <li
                key={feed.feedId}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-white">
                    {sourceLabel(feed.feedId, sourceLabels)}
                  </span>
                  <span
                    className={
                      feed.status === "success"
                        ? "text-xs text-slate-300"
                        : "text-xs text-slate-500"
                    }
                  >
                    {feed.status === "success"
                      ? t("feedHealthOk", { count: feed.itemCount })
                      : t("feedHealthError")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
