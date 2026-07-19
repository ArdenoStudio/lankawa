import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPulseSnapshot } from "@/lib/pulse";

export default async function DisasterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("disaster");
  const snapshot = await buildPulseSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {snapshot.flood.map((alert) => (
          <article
            key={alert.alertLevel}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <h2 className="text-lg font-semibold text-white">
              {alert.alertLevel}
            </h2>
            <p className="mt-2 text-3xl font-semibold text-teal-300">
              {alert.count}
            </p>
            <p className="mt-1 text-sm text-slate-400">{t("stations")}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
