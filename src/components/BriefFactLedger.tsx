import { getTranslations } from "next-intl/server";
import type { PulseMetric } from "@/lib/types";

const FACT_IDS = [
  "usd_lkr",
  "fuel_petrol_92",
  "weather_colombo",
  "power_status",
] as const;

export async function BriefFactLedger({
  metrics,
}: {
  metrics: PulseMetric[];
}) {
  const t = await getTranslations("brief");
  const facts = FACT_IDS.map((id) => metrics.find((metric) => metric.id === id)).filter(
    (metric): metric is PulseMetric => metric != null,
  );

  if (facts.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {t("factLedgerTitle")}
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2" role="list">
        {facts.map((fact) => (
          <li key={fact.id} className="text-sm text-slate-200">
            <span className="text-slate-500">{fact.label}: </span>
            {fact.value}
            {fact.unit ? ` ${fact.unit}` : ""}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-500">{t("factLedgerNote")}</p>
    </div>
  );
}
