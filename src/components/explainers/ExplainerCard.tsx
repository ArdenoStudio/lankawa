import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  explainerTranslationKey,
  type ExplainerDefinition,
} from "@/lib/explainers";

const TOPIC_STYLES: Record<
  ExplainerDefinition["topic"],
  string
> = {
  economy: "border-teal-500/25 bg-teal-500/5 text-teal-200",
  disaster: "border-amber-500/25 bg-amber-500/5 text-amber-200",
  platform: "border-slate-500/25 bg-slate-500/5 text-slate-200",
};

export async function ExplainerCard({ explainer }: { explainer: ExplainerDefinition }) {
  const t = await getTranslations("learn");
  const itemKey = explainerTranslationKey(explainer.slug);

  return (
    <article className="lk-card flex h-full flex-col p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${TOPIC_STYLES[explainer.topic]}`}
        >
          {t(`topics.${explainer.topic}`)}
        </span>
        <span className="text-xs text-slate-500">
          {t("readTime", { minutes: explainer.readMinutes })}
        </span>
      </div>

      <h2 className="mt-4 text-lg font-semibold text-white">
        {t(`items.${itemKey}.title`)}
      </h2>
      <p className="mt-2 flex-1 text-sm text-slate-400">
        {t(`items.${itemKey}.summary`)}
      </p>

      <Link
        href={`/learn/${explainer.slug}`}
        className="mt-5 inline-flex text-sm font-medium text-[var(--lk-teal-bright)] hover:text-teal-200"
      >
        {t("viewGuide")} →
      </Link>
    </article>
  );
}
