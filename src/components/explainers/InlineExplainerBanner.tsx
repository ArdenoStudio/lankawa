import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  explainerTranslationKey,
  type ExplainerSlug,
} from "@/lib/explainers";

export async function InlineExplainerBanner({ slug }: { slug: ExplainerSlug }) {
  const t = await getTranslations("learn");
  const itemKey = explainerTranslationKey(slug);

  return (
    <aside className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-200/80">
            {t("inlineEyebrow")}
          </p>
          <p className="text-sm font-medium text-white">
            {t(`items.${itemKey}.title`)}
          </p>
          <p className="max-w-xl text-sm text-slate-400">
            {t(`items.${itemKey}.inlineHint`)}
          </p>
        </div>
        <Link
          href={`/learn/${slug}`}
          className="shrink-0 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-100 transition hover:bg-teal-500/20"
        >
          {t("viewGuide")}
        </Link>
      </div>
    </aside>
  );
}
