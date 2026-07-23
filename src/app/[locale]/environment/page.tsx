import { getTranslations, setRequestLocale } from "next-intl/server";
import { EnvironmentDistrictTable } from "@/components/EnvironmentDistrictTable";
import { LandChangePulse } from "@/components/LandChangePulse";
import { Link } from "@/i18n/navigation";
import { getEnvironmentData } from "@/lib/environment";
import { getSourceProvenancePath } from "@/lib/sources";

const LIVE_AQI_SOURCE_IDS = new Set(["openaq_lk", "open_meteo_air_quality"]);

export default async function EnvironmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("environment");
  const snapshot = await getEnvironmentData();
  const isLiveOverlay = LIVE_AQI_SOURCE_IDS.has(snapshot.sourceId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          {isLiveOverlay ? t("subtitleLive") : t("subtitle")}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {isLiveOverlay
            ? t("asOfLive", { date: snapshot.asOf })
            : t("asOf", { date: snapshot.asOf })}{" "}
          ·{" "}
          <Link
            href={getSourceProvenancePath(snapshot.sourceId)}
            className="text-teal-300 hover:text-teal-200"
          >
            {snapshot.sourceName}
          </Link>
        </p>
      </div>

      <EnvironmentDistrictTable locale={locale} districts={snapshot.districts} />

      <LandChangePulse locale={locale} />

      <p className="text-sm text-slate-500">
        {t("healthLink")}{" "}
        <Link href="/health" className="text-teal-300 hover:text-teal-200">
          {t("healthLinkAction")}
        </Link>
      </p>

      <p className="text-sm text-slate-500">
        {isLiveOverlay ? t("disclaimerLive") : t("disclaimer")}
      </p>
    </div>
  );
}
