import { getTranslations } from "next-intl/server";
import { FreshnessBadge } from "@/components/FreshnessBadge";

export async function ExplainerDemoFx() {
  const t = await getTranslations("learn.items.fxRates.demo");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">{t("cardLabel")}</p>
            <p className="mt-1 text-3xl font-semibold text-white">302.45</p>
            <p className="text-sm text-slate-500">LKR · {t("headlineNote")}</p>
          </div>
          <FreshnessBadge tier="fresh" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {t("buyLabel")}
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-200">298.12</p>
            <p className="mt-1 text-xs text-slate-500">{t("buyHint")}</p>
          </div>
          <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-teal-300/80">
              {t("sellLabel")}
            </p>
            <p className="mt-1 text-xl font-semibold text-teal-100">302.45</p>
            <p className="mt-1 text-xs text-teal-200/70">{t("sellHint")}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-500">{t("footnote")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[t("step1"), t("step2"), t("step3")].map((step, index) => (
          <div
            key={step}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300"
          >
            <span className="mr-2 font-semibold text-teal-300">{index + 1}.</span>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
