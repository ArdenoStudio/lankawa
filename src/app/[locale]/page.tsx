import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertPins } from "@/components/AlertPins";
import { WebPushOptIn } from "@/components/WebPushOptIn";
import { BriefSubscribeForm } from "@/components/BriefSubscribeForm";
import { ColomboAirQualityStrip } from "@/components/ColomboAirQualityStrip";
import { CricketCard } from "@/components/CricketCard";
import { CseWatchlistChip } from "@/components/CseWatchlistChip";
import { DataSaverGate } from "@/components/DataSaverGate";
import { DepthRail } from "@/components/DepthRail";
import { DistrictMorningPack } from "@/components/DistrictMorningPack";
import { HolidayTodayStrip } from "@/components/HolidayTodayStrip";
import { HomeDistrictPin } from "@/components/HomeDistrictPin";
import { HomeHazardToast } from "@/components/HomeHazardToast";
import { LankaStressCard } from "@/components/LankaStressCard";
import { MorningBrief } from "@/components/MorningBrief";
import { MorningDeltaStrip } from "@/components/MorningDeltaStrip";
import { NewsPulse } from "@/components/NewsPulse";
import { OfflineMorningShell } from "@/components/OfflineMorningShell";
import { PulseCard } from "@/components/PulseCard";
import { HeroSection } from "@/components/HeroSection";
import { RetentionBeacon } from "@/components/RetentionBeacon";
import { ShareMorningCheck } from "@/components/ShareMorningCheck";
import { SourceHealthBar } from "@/components/SourceHealthBar";
import { WeekLedger } from "@/components/WeekLedger";
import { buildAlertSignalContext } from "@/lib/alert-context";
import { buildDistrictMorningPacks } from "@/lib/district-morning";
import { floodAttentionByDistrict } from "@/lib/flood-districts";
import { fetchFirmsSnapshot } from "@/lib/integrations/firms";
import { fetchLandslideSnapshot } from "@/lib/integrations/landslide";
import { buildLankaStressIndex } from "@/lib/lanka-stress";
import { buildPulseSnapshot, getTodayPulseMetrics } from "@/lib/pulse";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const ogImage = "/api/og/morning";
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [ogImage],
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const [snapshot, firms, landslides, morningPacks] = await Promise.all([
    buildPulseSnapshot(),
    fetchFirmsSnapshot(),
    fetchLandslideSnapshot(),
    buildDistrictMorningPacks(),
  ]);
  const [alertContext, stressIndex] = await Promise.all([
    buildAlertSignalContext(snapshot),
    buildLankaStressIndex(snapshot),
  ]);
  const todayMetrics = getTodayPulseMetrics(snapshot.metrics);
  const shareMetrics = todayMetrics
    .filter((metric) =>
      [
        "usd_lkr",
        "fuel_petrol_92",
        "fuel_diesel",
        "weather_colombo",
        "aqi_colombo",
        "power_status",
      ].includes(metric.id),
    )
    .map((metric) => ({
      id: metric.id,
      label: metric.label,
      value: metric.value,
      unit: metric.unit,
      note: metric.note,
    }));

  const hazardFires = firms.fires.map((fire) => ({
    id: fire.id,
    latitude: fire.latitude,
    longitude: fire.longitude,
  }));
  const hazardLandslides = landslides.districts.map((row) => ({
    slug: row.slug,
    tier: row.tier,
  }));
  const floodElevatedDistricts = [
    ...floodAttentionByDistrict(snapshot.flood).keys(),
  ];

  return (
    <div className="space-y-12 md:space-y-16">
      <RetentionBeacon locale={locale} />
      <HeroSection />
      <OfflineMorningShell />
      <HomeDistrictPin locale={locale} />
      <DistrictMorningPack packs={morningPacks} locale={locale} />
      <HomeHazardToast
        locale={locale}
        fires={hazardFires}
        landslides={hazardLandslides}
        floodElevatedDistricts={floodElevatedDistricts}
      />
      <WeekLedger />
      <AlertPins context={alertContext} />
      <WebPushOptIn />

      <section className="space-y-6" id="today">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
              {t("pulseTitle")}
            </h2>
            <div className="lk-brand-stripe w-12" aria-hidden="true" />
            <p className="max-w-xl text-sm leading-relaxed text-neutral-400 md:text-base">
              {t("pulseSubtitle")}
            </p>
          </div>
          <ShareMorningCheck metrics={shareMetrics} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {todayMetrics.map((metric, index) => (
            <div
              key={metric.id}
              className={
                index === 0
                  ? "animate-[lk-fade-up_0.4s_ease-out_both] sm:col-span-2 lg:col-span-1"
                  : "animate-[lk-fade-up_0.4s_ease-out_both]"
              }
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <PulseCard metric={metric} featured={index === 0} />
            </div>
          ))}
        </div>
        <MorningDeltaStrip />
        <HolidayTodayStrip />
        <ColomboAirQualityStrip />
      </section>

      <LankaStressCard index={stressIndex} />

      <DataSaverGate hideUntilHydrated>
        <CricketCard />
      </DataSaverGate>

      <CseWatchlistChip />

      <MorningBrief locale={locale} />
      <BriefSubscribeForm />

      <NewsPulse headlineLimit={5} />

      <DepthRail />

      <SourceHealthBar sources={snapshot.sources} />
    </div>
  );
}
