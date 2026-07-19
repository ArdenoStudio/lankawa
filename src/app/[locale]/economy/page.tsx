import { getTranslations, setRequestLocale } from "next-intl/server";
import { PulseCard } from "@/components/PulseCard";
import { buildPulseSnapshot } from "@/lib/pulse";

export default async function EconomyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("economy");
  const snapshot = await buildPulseSnapshot();
  const economyMetrics = snapshot.metrics.filter((metric) =>
    ["usd_lkr", "fuel_petrol_92", "fuel_diesel"].includes(metric.id),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {economyMetrics.map((metric) => (
          <PulseCard key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
}
