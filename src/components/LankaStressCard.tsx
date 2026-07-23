import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { LankaStressIndex } from "@/lib/lanka-stress";

export async function LankaStressCard({
  index,
}: {
  index: LankaStressIndex;
}) {
  const t = await getTranslations("stress");

  const tierLabel = (() => {
    switch (index.tier) {
      case "calm":
        return t("tierCalm");
      case "watch":
        return t("tierWatch");
      case "elevated":
        return t("tierElevated");
      case "severe":
        return t("tierSevere");
      default: {
        const _exhaustive: never = index.tier;
        return _exhaustive;
      }
    }
  })();

  return (
    <section
      className="rounded-2xl border border-white/15 bg-white/[0.03] p-4"
      aria-label={t("title")}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("eyebrow")}
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold text-white">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">{t("subtitle")}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-semibold tabular-nums text-white">
            {index.score}
          </p>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {tierLabel}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {index.components.map((component) => {
          const label = (() => {
            switch (component.id) {
              case "fx":
                return t("componentFx");
              case "flood":
                return t("componentFlood");
              case "power":
                return t("componentPower");
              case "met":
                return t("componentMet");
              case "landslide":
                return t("componentLandslide");
              case "dengue":
                return t("componentDengue");
              default:
                return component.label;
            }
          })();

          return (
            <li
              key={component.id}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/5 pb-2 last:border-0"
            >
              <span>
                {label}
                {!component.available ? (
                  <span className="ml-2 text-[10px] uppercase tracking-wide text-slate-500">
                    {t("unavailable")}
                  </span>
                ) : null}
              </span>
              <span className="tabular-nums text-slate-200">
                {component.score}
                <span className="text-slate-500">/{component.weight}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <details className="mt-4 text-sm text-slate-400">
        <summary className="cursor-pointer text-teal-300 hover:text-teal-200">
          {t("methodologyTitle")}
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-500">
          {index.methodology.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>

      <p className="mt-3 text-xs text-slate-500">{t("honesty")}</p>
      {index.isPartial ? (
        <p className="mt-1 text-xs text-amber-200/80">{t("partial")}</p>
      ) : null}
      <p className="mt-2 text-xs text-slate-500">
        <Link
          href={index.provenancePath}
          className="text-teal-300 hover:text-teal-200"
        >
          {t("source")}
        </Link>
        {" · "}
        {t("asOf", { date: new Date(index.asOf).toLocaleString() })}
      </p>
    </section>
  );
}
