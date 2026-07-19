import { getTranslations, setRequestLocale } from "next-intl/server";
import { PulseCard } from "@/components/PulseCard";
import { DistrictGrid, SourceHealthList } from "@/components/DistrictCard";
import { Link } from "@/i18n/navigation";
import { buildPulseSnapshot } from "@/lib/pulse";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const snapshot = await buildPulseSnapshot();

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
          {t("eyebrow")}
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-lg text-slate-400">{t("subtitle")}</p>
        <p className="text-sm text-slate-500">{t("disclaimer")}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">{t("pulseTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.metrics.map((metric) => (
            <PulseCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">{t("sourcesTitle")}</h2>
        <SourceHealthList sources={snapshot.sources} />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {t("districtsTitle")}
            </h2>
            <p className="mt-2 text-slate-400">{t("districtsSubtitle")}</p>
          </div>
          <Link
            href="/districts"
            className="rounded-full bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-teal-400"
          >
            {t("viewDistricts")}
          </Link>
        </div>
        <DistrictGrid locale={locale} limit={6} />
      </section>
    </div>
  );
}
