import { getTranslations, setRequestLocale } from "next-intl/server";
import { CycloneWatchCard } from "@/components/CycloneWatchCard";
import { DataSaverGate } from "@/components/DataSaverGate";
import { DataSaverMapFallback } from "@/components/DataSaverMapFallback";
import { DisasterRiskMapLazy } from "@/components/DisasterRiskMapLazy";
import { DmcBulletinStrip } from "@/components/DmcBulletinStrip";
import { EarthquakePanel } from "@/components/EarthquakePanel";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { GlofasBasinPanel } from "@/components/GlofasBasinPanel";
import { HazardPinsPanel } from "@/components/HazardPinsPanel";
import { InlineExplainerBanner } from "@/components/explainers/InlineExplainerBanner";
import { IrrigationGaugesPanel } from "@/components/IrrigationGaugesPanel";
import { LandslidePanel } from "@/components/LandslidePanel";
import { MetDeptWarningsPanel } from "@/components/MetDeptWarningsPanel";
import { Link } from "@/i18n/navigation";
import { buildCycloneWatch } from "@/lib/cyclone-watch";
import {
  parseDisasterMapLayers,
  parseDisasterMapPreset,
} from "@/lib/disaster-map-layers";
import { fetchEarthquakeSnapshot } from "@/lib/integrations/earthquake";
import { fetchFirmsSnapshot } from "@/lib/integrations/firms";
import { fetchGdacsSnapshot } from "@/lib/integrations/gdacs";
import { fetchGlofasBasinSnapshot } from "@/lib/integrations/glofas";
import { fetchIrrigationGaugesSnapshot } from "@/lib/integrations/irrigation-gauges";
import { fetchLandslideSnapshot } from "@/lib/integrations/landslide";
import { fetchLECOOutages } from "@/lib/integrations/leco";
import { fetchMetDeptWarnings } from "@/lib/integrations/metdept";
import { fetchPowerStatus } from "@/lib/integrations/power";
import { powerConcentrationByDistrict } from "@/lib/power-concentration";
import { buildPulseSnapshot } from "@/lib/pulse";
import { getSourceProvenancePath } from "@/lib/sources";

export default async function DisasterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ layers?: string; preset?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("disaster");
  const [
    snapshot,
    power,
    leco,
    earthquakes,
    metWarnings,
    landslides,
    firms,
    gdacs,
    glofas,
    irrigationGauges,
  ] = await Promise.all([
    buildPulseSnapshot(),
    fetchPowerStatus(),
    fetchLECOOutages(),
    fetchEarthquakeSnapshot(),
    fetchMetDeptWarnings(),
    fetchLandslideSnapshot(),
    fetchFirmsSnapshot(),
    fetchGdacsSnapshot(),
    fetchGlofasBasinSnapshot(),
    fetchIrrigationGaugesSnapshot(),
  ]);

  const cycloneWatch = buildCycloneWatch(gdacs);
  const concentration = powerConcentrationByDistrict([
    ...power.affectedAreas,
    ...leco.affectedAreas,
  ]);
  const initialLayers =
    parseDisasterMapPreset(query.preset) ??
    parseDisasterMapLayers(query.layers);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>

      <DmcBulletinStrip />

      <CycloneWatchCard
        watch={cycloneWatch}
        locale={locale}
        labels={{
          title: t("cyclone.title"),
          subtitle: t("cyclone.subtitle"),
          empty: t("cyclone.empty"),
          active: t("cyclone.active"),
          alertLevel: t("cyclone.alertLevel"),
          report: t("cyclone.report"),
          honesty: t("cyclone.honesty"),
          source: t("cyclone.source"),
        }}
      />

      <DataSaverGate fallback={<DataSaverMapFallback height={380} />}>
        <DisasterRiskMapLazy
          flood={snapshot.flood}
          landslideDistricts={landslides.districts}
          firmsPins={firms.fires}
          gdacsEvents={gdacs.events}
          irrigationGauges={irrigationGauges.gauges}
          initialLayers={initialLayers}
          locale={locale}
        />
      </DataSaverGate>

      <GlofasBasinPanel
        snapshot={glofas}
        labels={{
          title: t("glofas.title"),
          subtitle: t("glofas.subtitle"),
          seed: t("glofas.seed"),
          discharge: t("glofas.discharge"),
          empty: t("glofas.empty"),
          honesty: t("glofas.honesty"),
          asOf: t("glofas.asOf"),
        }}
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{t("powerTitle")}</h2>
          <p className="mt-1 text-sm text-slate-400">{t("powerSubtitle")}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {t("cebCardTitle")}
                </p>
                <p className="mt-2 text-sm text-slate-400">{t("powerStatusLabel")}</p>
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

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {t("lecoCardTitle")}
                </p>
                <p className="mt-2 text-sm text-slate-400">{t("lecoStatusLabel")}</p>
                <p className="mt-1 text-2xl font-semibold text-teal-300">
                  {t(`powerStatus.${leco.status}`)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <FreshnessBadge tier={leco.tier} />
                <p className="text-xs text-slate-500">
                  {t("powerObservedAt", {
                    time: new Date(leco.observedAt).toLocaleString(locale),
                  })}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-300">{leco.summary}</p>
            {leco.isSeed ? (
              <p className="mt-2 text-xs text-amber-200/80">{t("lecoSeed")}</p>
            ) : null}
            {leco.affectedAreas.length > 0 ? (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-200">
                  {t("powerAffectedAreas")}
                </p>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {leco.affectedAreas.map((area) => (
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
              <p className="mt-4 text-sm text-slate-500">{t("lecoNoAffectedAreas")}</p>
            )}
            <p className="mt-4 text-xs text-slate-500">{t("lecoHonesty")}</p>
            <p className="mt-2 text-xs text-slate-500">
              <Link
                href={getSourceProvenancePath("leco_power")}
                className="text-teal-300 hover:text-teal-200"
              >
                {t("lecoSourceNote")}
              </Link>
            </p>
          </article>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {t("concentrationTitle")}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {t("concentrationSubtitle")}
          </p>
        </div>
        {concentration.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-500">
            {t("concentrationEmpty")}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    {t("concentrationDistrict")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t("concentrationMentions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {concentration.map((row) => (
                  <tr
                    key={row.slug}
                    className="border-b border-white/5 text-slate-200 last:border-0"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/districts/${row.slug}`}
                        className="text-teal-300 hover:text-teal-200"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">{row.mentions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-slate-500">{t("concentrationHonesty")}</p>
      </section>

      <InlineExplainerBanner slug="flood-levels" />

      <IrrigationGaugesPanel
        snapshot={irrigationGauges}
        locale={locale}
        labels={{
          title: t("irrigation.title"),
          subtitle: t("irrigation.subtitle"),
          seed: t("irrigation.seed"),
          empty: t("irrigation.empty"),
          honesty: t("irrigation.honesty"),
          asOf: t("irrigation.asOf"),
          source: t("irrigation.source"),
          dashboard: t("irrigation.dashboard"),
          stations: t("irrigation.stations"),
          elevated: t("irrigation.elevated"),
          level: t("irrigation.level"),
          rain: t("irrigation.rain"),
          normal: t("irrigation.normal"),
          alert: t("irrigation.alert"),
          warning: t("irrigation.warning"),
          danger: t("irrigation.danger"),
        }}
      />

      <LandslidePanel
        snapshot={landslides}
        locale={locale}
        labels={{
          title: t("landslideTitle"),
          subtitle: t("landslideSubtitle"),
          watch: t("landslideWatch"),
          warning: t("landslideWarning"),
          watchSeed: t("landslideWatchSeed"),
          warningSeed: t("landslideWarningSeed"),
          asOf: t("landslideAsOf"),
          seed: t("landslideSeed"),
          live: t("landslideLive"),
          honesty: t("landslideHonesty"),
          honestySeed: t("landslideHonestySeed"),
          source: t("landslideSource"),
          nbro: t("landslideNbro"),
          bulletin: t("landslideBulletin"),
          topDistricts: t("landslideTopDistricts"),
          topDistrictsSeed: t("landslideTopDistrictsSeed"),
          noneActive: t("landslideNoneActive"),
          noneActiveSeed: t("landslideNoneActiveSeed"),
        }}
      />

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
          actionRequired: t("metActionRequired"),
          damageExpected: t("metDamageExpected"),
          urgency: t("metUrgency"),
          severity: t("metSeverity"),
          certainty: t("metCertainty"),
          capXml: t("metCapXml"),
          officialPage: t("metOfficialPage"),
          feedCapOnly: t("metFeedCapOnly"),
          feedEnriched: t("metFeedEnriched"),
          honesty: t("metHonesty"),
          sourceNote: t("metSourceNote"),
          provenance: t("metProvenance"),
        }}
      />

      <HazardPinsPanel
        firms={firms}
        gdacs={gdacs}
        locale={locale}
        labels={{
          title: t("hazardTitle"),
          subtitle: t("hazardSubtitle"),
          firesTitle: t("firesTitle"),
          firesEmpty: t("firesEmpty"),
          firesNeedsKey: t("firesNeedsKey"),
          firesCount: t("firesCount"),
          brightness: t("firesBrightness"),
          confidence: t("firesConfidence"),
          gdacsTitle: t("gdacsTitle"),
          gdacsEmpty: t("gdacsEmpty"),
          alertLevel: t("gdacsAlertLevel"),
          eventType: t("gdacsEventType"),
          country: t("gdacsCountry"),
          report: t("gdacsReport"),
          firmsSource: t("firmsSource"),
          gdacsSource: t("gdacsSource"),
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
