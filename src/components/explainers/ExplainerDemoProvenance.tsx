import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FreshnessBadge } from "@/components/FreshnessBadge";

export async function ExplainerDemoProvenance() {
  const t = await getTranslations("learn.items.provenance.demo");

  return (
    <div className="space-y-4">
      <ol className="relative space-y-0">
        {(["metric", "source", "upstream"] as const).map((step, index, arr) => (
          <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
            {index < arr.length - 1 ? (
              <span
                className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-teal-500/30"
                aria-hidden="true"
              />
            ) : null}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-teal-500/30 bg-teal-500/10 text-sm font-semibold text-teal-200">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t(`steps.${step}.label`)}
              </p>
              <p className="mt-1 font-medium text-white">
                {t(`steps.${step}.title`)}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {t(`steps.${step}.body`)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">{t("previewLabel")}</p>
            <p className="mt-1 font-medium text-white">{t("previewMetric")}</p>
          </div>
          <FreshnessBadge tier="fresh" />
        </div>
        <Link
          href="/sources/cbsl_fx"
          className="mt-4 inline-flex text-sm text-teal-300 hover:text-teal-200"
        >
          {t("previewLink")} →
        </Link>
      </div>
    </div>
  );
}
