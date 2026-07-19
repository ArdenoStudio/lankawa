import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertPins } from "@/components/AlertPins";
import { BriefSubscribeForm } from "@/components/BriefSubscribeForm";
import { CricketCard } from "@/components/CricketCard";
import { DataSaverGate } from "@/components/DataSaverGate";
import { HomeDistrictPin } from "@/components/HomeDistrictPin";
import { MorningBrief } from "@/components/MorningBrief";
import { MorningDeltaStrip } from "@/components/MorningDeltaStrip";
import { NewsPulse } from "@/components/NewsPulse";
import { PulseCard } from "@/components/PulseCard";
import { HeroSection } from "@/components/HeroSection";
import { RetentionBeacon } from "@/components/RetentionBeacon";
import { ShareMorningCheck } from "@/components/ShareMorningCheck";
import { SourceHealthBar } from "@/components/SourceHealthBar";
import { WeekLedger } from "@/components/WeekLedger";
import { Link } from "@/i18n/navigation";
import { buildAlertSignalContext } from "@/lib/alert-context";
import { buildPulseSnapshot, getTodayPulseMetrics } from "@/lib/pulse";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const snapshot = await buildPulseSnapshot();
  const alertContext = await buildAlertSignalContext(snapshot);
  const todayMetrics = getTodayPulseMetrics(snapshot.metrics);
  const shareMetrics = todayMetrics
    .filter((metric) =>
      ["usd_lkr", "fuel_petrol_92", "fuel_diesel", "weather_colombo", "power_status"].includes(
        metric.id,
      ),
    )
    .map((metric) => ({
      id: metric.id,
      label: metric.label,
      value: metric.value,
      unit: metric.unit,
      note: metric.note,
    }));

  return (
    <div className="space-y-10 md:space-y-14">
      <RetentionBeacon locale={locale} />
      <HeroSection />
      <HomeDistrictPin locale={locale} />
      <WeekLedger />
      <AlertPins context={alertContext} />

      <section className="space-y-5" id="today">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">
              {t("pulseTitle")}
            </h2>
            <p className="mt-2 text-slate-400">{t("pulseSubtitle")}</p>
          </div>
          <ShareMorningCheck metrics={shareMetrics} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {todayMetrics.map((metric, index) => (
            <div
              key={metric.id}
              className="animate-[lk-fade-up_0.4s_ease-out_both]"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <PulseCard metric={metric} />
            </div>
          ))}
        </div>
        <MorningDeltaStrip />
      </section>

      <DataSaverGate hideUntilHydrated>
        <CricketCard />
      </DataSaverGate>

      <MorningBrief locale={locale} />
      <BriefSubscribeForm />

      <NewsPulse headlineLimit={5} />

      <section className="space-y-3 border-t border-white/10 pt-8">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            {t("depthTitle")}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            {t("depthSubtitle")}
          </p>
        </div>
        <nav
          aria-label={t("depthTitle")}
          className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium"
        >
          <Link href="/districts" className="text-teal-300 hover:text-teal-200">
            {t("depthDistricts")}
          </Link>
          <Link href="/economy" className="text-teal-300 hover:text-teal-200">
            {t("depthEconomy")}
          </Link>
          <Link href="/disaster" className="text-teal-300 hover:text-teal-200">
            {t("depthDisaster")}
          </Link>
          <Link href="/explore" className="text-teal-300 hover:text-teal-200">
            {t("depthExplore")}
          </Link>
          <Link href="/learn" className="text-teal-300 hover:text-teal-200">
            {t("depthLearn")}
          </Link>
        </nav>
      </section>

      <SourceHealthBar sources={snapshot.sources} />
    </div>
  );
}
