import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataSaverGate } from "@/components/DataSaverGate";
import { DisasterRiskMap } from "@/components/DisasterRiskMap";
import { EarthquakePanel } from "@/components/EarthquakePanel";
import { InlineExplainerBanner } from "@/components/explainers/InlineExplainerBanner";
import { LandslidePanel } from "@/components/LandslidePanel";
import { MetDeptWarningsPanel } from "@/components/MetDeptWarningsPanel";
import { fetchEarthquakeSnapshot } from "@/lib/integrations/earthquake";
import { fetchLandslideSnapshot } from "@/lib/integrations/landslide";
import { fetchMetDeptWarnings } from "@/lib/integrations/metdept";
import { fetchPowerStatus } from "@/lib/integrations/power";
import { buildPulseSnapshot } from "@/lib/pulse";

export default async function DisasterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("disaster");
  const [snapshot, power, earthquakes, metWarnings, landslides] =
    await Promise.all([
      buildPulseSnapshot(),
      fetchPowerStatus(),
      fetchEarthquakeSnapshot(),
      fetchMetDeptWarnings(),
      fetchLandslideSnapshot(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{t("powerTitle")}</h2>
          <p className="mt-1 text-sm text-slate-400">{t("powerSubtitle")}</p>
        </div>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">{t("powerStatusLabel")}</p>
              <p className="mt-1 text-2xl font-semibold text-teal-300">
                {t(`powerStatus.${power.status}`)}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              {t("powerObservedAt", {
                time: new Date(power.observedAt).toLocaleString(locale),
              })}
            </p>
          </div>
          <p className="mt-4 text-sm text-slate-300">{power.summary}</p>
          {power.affectedAreas.length > 0 ? (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-200">
                {t("powerAffectedAreas")}
              </p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {power.affectedAreas.map((area) => (
                  <li
                    key={area}
                    className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-300"
                  >
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">{t("powerNoAffectedAreas")}</p>
          )}
          <p className="mt-4 text-xs text-slate-500">{t("powerSourceNote")}</p>
        </article>
      </section>

      <InlineExplainerBanner slug="flood-levels" />

      <LandslidePanel
        snapshot={landslides}
        locale={locale}
        labels={{
          title: t("landslideTitle"),
          subtitle: t("landslideSubtitle"),
          watch: t("landslideWatch"),
          warning: t("landslideWarning"),
          asOf: t("landslideAsOf"),
          seed: t("landslideSeed"),
          honesty: t("landslideHonesty"),
          source: t("landslideSource"),
          nbro: t("landslideNbro"),
          topDistricts: t("landslideTopDistricts"),
          noneActive: t("landslideNoneActive"),
        }}
      />

      <DataSaverGate>
        <DisasterRiskMap
          flood={snapshot.flood}
          landslideDistricts={landslides.districts}
        />
      </DataSaverGate>

      <MetDeptWarningsPanel
        snapshot={metWarnings}
        locale={locale}
        labels={{
          title: t("metTitle"),
          subtitle: t("metSubtitle"),
          unavailableTitle: t("metUnavailableTitle"),
          unavailableBody: t("metUnavailableBody"),
          emptyTitle: t("metEmptyTitle"),
          emptyBody: t("metEmptyBody"),
          issuedAt: t("metIssuedAt"),
          checkedAt: t("metCheckedAt"),
          activeCount: t("metActiveCount", {
            count: metWarnings?.warnings.length ?? 0,
          }),
          validWindow: t("metValidWindow", { from: "{from}", to: "{to}" }),
          areas: t("metAreas"),
          noSummary: t("metNoSummary"),
          sourceNote: t("metSourceNote"),
          provenance: t("metProvenance"),
        }}
      />

      <EarthquakePanel
        snapshot={earthquakes}
        locale={locale}
        labels={{
          title: t("earthquakeTitle"),
          subtitle: t("earthquakeSubtitle"),
          emptyTitle: t("earthquakeEmptyTitle"),
          emptyBody: t("earthquakeEmptyBody", {
            minMagnitude: earthquakes.minMagnitude,
            days: earthquakes.queryWindowDays,
          }),
          emptyScopeNote: t("earthquakeEmptyScopeNote", {
            minLat: earthquakes.bbox.minLat,
            maxLat: earthquakes.bbox.maxLat,
            minLon: earthquakes.bbox.minLon,
            maxLon: earthquakes.bbox.maxLon,
          }),
          emptyOffshoreNote: t("earthquakeEmptyOffshoreNote"),
          errorTitle: t("earthquakeErrorTitle"),
          errorBody: t("earthquakeErrorBody"),
          magnitude: t("earthquakeMagnitude"),
          depth: t("earthquakeDepth"),
          coordinates: t("earthquakeCoordinates"),
          occurredAt: t("earthquakeOccurredAt"),
          tsunamiFlag: t("earthquakeTsunamiFlag"),
          windowLabel: t("earthquakeWindowLabel", {
            days: earthquakes.queryWindowDays,
            minMagnitude: earthquakes.minMagnitude,
          }),
          bboxLabel: t("earthquakeBboxLabel", {
            minLat: earthquakes.bbox.minLat,
            maxLat: earthquakes.bbox.maxLat,
            minLon: earthquakes.bbox.minLon,
            maxLon: earthquakes.bbox.maxLon,
          }),
          sourceNote: t("earthquakeSourceNote"),
          provenance: t("earthquakeProvenance"),
          countLabel: t("earthquakeCountLabel", { count: earthquakes.events.length }),
        }}
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{t("floodTitle")}</h2>
          <p className="mt-1 text-sm text-slate-400">{t("floodSubtitle")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.flood.map((alert) => (
            <article
              key={alert.alertLevel}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <h3 className="text-lg font-semibold text-white">
                {alert.alertLevel}
              </h3>
              <p className="mt-2 text-3xl font-semibold text-teal-300">
                {alert.count}
              </p>
              <p className="mt-1 text-sm text-slate-400">{t("stations")}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
