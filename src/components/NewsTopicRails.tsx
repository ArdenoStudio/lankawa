"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export interface TopicRailItem {
  id: string;
  topic: string;
  headlineCount: number;
  outletCount: number;
  leadTitle: string;
}

export function NewsTopicRails({
  topics,
  locale,
}: {
  topics: TopicRailItem[];
  locale: string;
}) {
  const t = useTranslations("news");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (topics.length === 0) {
    return null;
  }

  async function cite(topic: TopicRailItem) {
    const citation = `${topic.leadTitle} — Lankawa cluster (${topic.outletCount} outlets). https://lankawa.vercel.app/${locale}/news/clusters/${topic.id}`;
    try {
      await navigator.clipboard.writeText(citation);
      setCopiedId(topic.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold text-white">{t("topicRailsTitle")}</h2>
        <p className="mt-1 text-sm text-neutral-400">{t("topicRailsSubtitle")}</p>
      </div>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {topics.map((topic) => (
          <article
            key={topic.id}
            className="min-w-[220px] max-w-[260px] shrink-0 border border-white/15 px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
              {topic.topic}
            </p>
            <Link
              href={`/news/clusters/${topic.id}`}
              className="mt-2 block text-sm font-medium text-white underline decoration-white/25 hover:decoration-white"
            >
              {topic.leadTitle}
            </Link>
            <p className="mt-2 text-xs text-neutral-500">
              {t("clusterMeta", {
                count: topic.headlineCount,
                outlets: topic.outletCount,
              })}
            </p>
            <button
              type="button"
              onClick={() => void cite(topic)}
              className="mt-3 border border-white/25 px-3 py-1 text-xs text-neutral-200 transition hover:border-white/50"
            >
              {copiedId === topic.id ? t("citeCopied") : t("citeCluster")}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
