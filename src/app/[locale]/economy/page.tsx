import { getTranslations, setRequestLocale } from "next-intl/server";
import { CseMarketCard } from "@/components/CseMarketCard";
import { DebtCompositionCard } from "@/components/DebtCompositionCard";
import { CricketCard } from "@/components/CricketCard";
import {
  FuelHistoryChart,
  FuelRevisionSteps,
  FxSparkline,
  LpgPriceCard,
  MacroIndicatorCard,
} from "@/components/EconomyCards";
import { DataSaverGate } from "@/components/DataSaverGate";
import { HouseholdEnergySection } from "@/components/HouseholdEnergySection";
import { InlineExplainerBanner } from "@/components/explainers/InlineExplainerBanner";
import { LpgDistrictFilter } from "@/components/LpgDistrictFilter";
import { MacroObservationsStrip } from "@/components/MacroObservationsStrip";
import { MarketsPressStrip } from "@/components/MarketsPressStrip";
import { NcpiInflationCard } from "@/components/NcpiInflationCard";
import { PucslGenerationMixSpark } from "@/components/PucslGenerationMixSpark";
import { PucslTariffCard } from "@/components/PucslTariffCard";
import { PulseCard } from "@/components/PulseCard";
import { RemittanceBoard } from "@/components/RemittanceBoard";
import { RemittanceCalculator } from "@/components/RemittanceCalculator";
import { SupermarketCardDays } from "@/components/SupermarketCardDays";
import { TreasuryYieldStrip } from "@/components/TreasuryYieldStrip";
import { WorldPumpCompare } from "@/components/WorldPumpCompare";
import { Link } from "@/i18n/navigation";
import { getEconomyMacroSnapshot, getFxSeries, getLatestFxRate } from "@/lib/economy";
import { computeFxAnomaly } from "@/lib/fx-anomaly";
import { getForeignDebtSnapshot } from "@/lib/foreign-debt";
import { fetchLatestCbslGoldRate } from "@/lib/integrations/cbsl";
import { fetchLpgPriceSnapshot } from "@/lib/integrations/lpg";
import { getFuelHistorySeries, getFuelRevisionSteps } from "@/lib/fuel";
import { buildCseSnapshot } from "@/lib/integrations/cse";
import { getNcpiSnapshot } from "@/lib/ncpi";
import { getPucslTariffSnapshot } from "@/lib/pucsl";
import { buildPulseSnapshot } from "@/lib/pulse";
import { getRemittanceTtSnapshot } from "@/lib/remittance";
import { getSource, getSourceProvenancePath } from "@/lib/sources";
import { getWorldPumpSnapshot } from "@/lib/world-pump";

export default async function EconomyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ district?: string }>;
}) {
  const { locale } = await params;
  const query = searchParams ? await searchParams : {};
  const preferredDistrict = query.district?.trim() || null;
  setRequestLocale(locale);
  const t = await getTranslations("economy");
  const snapshot = await buildPulseSnapshot();
  const macro = getEconomyMacroSnapshot();
  const fxSeries = await getFxSeries();
  const fxAnomaly = computeFxAnomaly(fxSeries);
  const latestFxRate = await getLatestFxRate();
  const remittanceTt = await getRemittanceTtSnapshot();
  const [fuelHistory, fuelRevisions] = await Promise.all([
    getFuelHistorySeries(90),
    getFuelRevisionSteps(8),
  ]);
  const cseSnapshot = await buildCseSnapshot();
  const goldRate = await fetchLatestCbslGoldRate();
  const lpgSnapshot = await fetchLpgPriceSnapshot();
  const debtSnapshot = getForeignDebtSnapshot();
  const ncpiSnapshot = getNcpiSnapshot();
  const tariffSnapshot = getPucslTariffSnapshot();
  const fxSource = getSource("cbsl_fx");
  const fuelSource = getSource("octane_fuel");
  const petrolMetric = snapshot.metrics.find(
    (metric) => metric.id === "fuel_petrol_92",
  );
  const dieselMetric = snapshot.metrics.find(
    (metric) => metric.id === "fuel_diesel",
  );
  const usdMetric = snapshot.metrics.find((metric) => metric.id === "usd_lkr");
  const worldPump = getWorldPumpSnapshot({
    sriLankaPetrolLkr: petrolMetric ? Number(petrolMetric.value) : null,
    usdLkr: usdMetric ? Number(usdMetric.value) : latestFxRate?.sellRate ?? null,
  });
  const economyMetrics = snapshot.metrics.filter((metric) =>
    ["usd_lkr", "fuel_petrol_92", "fuel_diesel"].includes(metric.id),
  );
  const householdFuel = [petrolMetric, dieselMetric]
    .filter((metric): metric is NonNullable<typeof metric> => metric != null)
    .map((metric) => ({
      id: metric.id,
      label: metric.label,
      value: metric.value,
      unit: metric.unit,
      tier: metric.tier,
    }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>

      <InlineExplainerBanner slug="fx-rates" />

      <TreasuryYieldStrip locale={locale} />

      <MacroObservationsStrip locale={locale} />

      <DataSaverGate hideUntilHydrated>
        <CricketCard variant="economy" />
      </DataSaverGate>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">{t("liveTitle")}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {economyMetrics.map((metric) => (
            <PulseCard key={metric.id} metric={metric} />
          ))}
          {goldRate ? (
            <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{t("gold.eyebrow")}</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {t("gold.title")}
                  </h3>
                </div>
                <Link
                  href={getSourceProvenancePath("cbsl_gold")}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {t("gold.provenance")}
                </Link>
              </div>
              <p className="mt-3 text-3xl font-semibold text-white">
                {goldRate.priceLkr.toLocaleString(locale, {
                  maximumFractionDigits: 0,
                })}
                <span className="ml-1 text-base font-normal text-slate-400">
                  LKR
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">{t("gold.unit")}</p>
              <p className="mt-3 text-xs text-slate-500">
                {t("gold.asOf", {
                  date: new Date(goldRate.observedAt).toLocaleDateString(locale),
                })}
              </p>
            </article>
          ) : null}
          <LpgPriceCard
            snapshot={lpgSnapshot}
            locale={locale}
            preferredDistrict={preferredDistrict}
            labels={{
              eyebrow: t("lpg.eyebrow"),
              title: t("lpg.title"),
              subtitle: t("lpg.subtitle"),
              cylinder12_5: t("lpg.cylinder12_5"),
              asOf: t("lpg.asOf", {
                date: new Date(lpgSnapshot.asOf).toLocaleDateString(locale),
              }),
              source: t("lpg.source"),
              seed: t("lpg.seed"),
              otherDistricts: t("lpg.otherDistricts"),
            }}
            filter={
              <LpgDistrictFilter
                prices={lpgSnapshot.prices}
                locale={locale}
                preferredDistrict={preferredDistrict}
                labels={{
                  filterLabel: t("lpg.filterLabel"),
                  allDistricts: t("lpg.allDistricts"),
                  cylinder12_5: t("lpg.cylinder12_5"),
                  empty: t("lpg.emptyDistrict"),
                }}
              />
            }
          />
        </div>
      </section>

      <HouseholdEnergySection
        fuel={householdFuel}
        lpg={lpgSnapshot}
        locale={locale}
        labels={{
          title: t("householdEnergy.title"),
          subtitle: t("householdEnergy.subtitle"),
          fuelTitle: t("householdEnergy.fuelTitle"),
          lpgTitle: t("householdEnergy.lpgTitle"),
          tariffTitle: t("householdEnergy.tariffTitle"),
          tariffTeaser: t("householdEnergy.tariffTeaser"),
          tariffCta: t("householdEnergy.tariffCta"),
          cylinder12_5: t("lpg.cylinder12_5"),
          emptyFuel: t("householdEnergy.emptyFuel"),
          emptyLpg: t("householdEnergy.emptyLpg"),
        }}
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{t("macroTitle")}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {t("macroSubtitle")} ·{" "}
            <Link
              href={getSourceProvenancePath(macro.sourceId)}
              className="text-teal-300 hover:text-teal-200"
            >
              {macro.sourceName}
            </Link>
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {macro.indicators.map((indicator) => (
            <MacroIndicatorCard
              key={indicator.id}
              label={indicator.label}
              value={indicator.value}
              unit={indicator.unit}
              period={indicator.period}
              tier="stale"
            />
          ))}
          <FxSparkline
            title={t("fxSparklineTitle")}
            series={fxSeries}
            asOf={macro.asOf}
            latestBand={latestFxRate}
            anomaly={fxAnomaly}
            chartId="economy-fx-usd-lkr-chart"
            citation={{
              sourceName: fxSource?.name ?? "Central Bank of Sri Lanka",
              sourcePath: getSourceProvenancePath("cbsl_fx"),
              permalink: `/${locale}/economy`,
            }}
            labels={{
              bandTitle: t("fxBandTitle"),
              buy: t("fxBuy"),
              sell: t("fxSell"),
              anomaly: t("fxAnomaly"),
              anomalyQuiet: t("fxAnomalyQuiet"),
            }}
          />
          <FuelHistoryChart
            title={t("fuelHistoryTitle")}
            series={fuelHistory}
            chartId="economy-fuel-history-chart"
            citation={{
              sourceName: fuelSource?.name ?? "Octane Fuel API",
              sourcePath: getSourceProvenancePath("octane_fuel"),
              permalink: `/${locale}/economy`,
            }}
          />
          <FuelRevisionSteps
            title={t("fuelRevisionsTitle")}
            subtitle={t("fuelRevisionsSubtitle")}
            steps={fuelRevisions}
            labels={{
              date: t("fuelRevisionsDate"),
              from: t("fuelRevisionsFrom"),
              to: t("fuelRevisionsTo"),
              empty: t("fuelRevisionsEmpty"),
            }}
          />
          <WorldPumpCompare
            snapshot={worldPump}
            labels={{
              title: t("worldPump.title"),
              subtitle: t("worldPump.subtitle"),
              seedBadge: t("worldPump.seedBadge"),
              liveBadge: t("worldPump.liveBadge"),
              asOf: t("worldPump.asOf"),
              methodology: t("worldPump.methodology"),
              empty: t("worldPump.empty"),
            }}
          />
          <DebtCompositionCard
            snapshot={debtSnapshot}
            sourcePath={getSourceProvenancePath(debtSnapshot.sourceId)}
            permalink={`/${locale}/economy`}
            labels={{
              title: t("debt.title"),
              subtitle: t("debt.subtitle"),
              commercial: t("debt.commercial"),
              concessionary: t("debt.concessionary"),
              latest: t("debt.latest"),
              delta: t("debt.delta"),
              asOf: t("debt.asOf", { date: debtSnapshot.asOf }),
              attribution: t("debt.attribution"),
              methodology: t("debt.methodology"),
            }}
          />
        </div>
      </section>

      <section id="household-tariffs" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {t("householdTitle")}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{t("householdSubtitle")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NcpiInflationCard
            snapshot={ncpiSnapshot}
            sourcePath={getSourceProvenancePath(ncpiSnapshot.sourceId)}
            permalink={`/${locale}/economy`}
            labels={{
              title: t("ncpi.title"),
              subtitle: t("ncpi.subtitle"),
              yoy: t("ncpi.yoy"),
              mom: t("ncpi.mom"),
              core: t("ncpi.core"),
              food: t("ncpi.food"),
              nonFood: t("ncpi.nonFood"),
              index: t("ncpi.index"),
              period: t("ncpi.period"),
              honesty: t("ncpi.honesty"),
              source: t("ncpi.source"),
              release: t("ncpi.release"),
            }}
          />
          <PucslTariffCard
            snapshot={tariffSnapshot}
            locale={locale}
            sourcePath={getSourceProvenancePath(tariffSnapshot.sourceId)}
            permalink={`/${locale}/economy`}
            labels={{
              title: t("tariff.title"),
              subtitle: t("tariff.subtitle"),
              effective: t("tariff.effective"),
              slab: t("tariff.slab"),
              energy: t("tariff.energy"),
              fixed: t("tariff.fixed"),
              unitsLabel: t("tariff.unitsLabel"),
              estimateTitle: t("tariff.estimateTitle"),
              energyTotal: t("tariff.energyTotal"),
              fixedTotal: t("tariff.fixedTotal"),
              billTotal: t("tariff.billTotal"),
              honesty: t("tariff.honesty"),
              source: t("tariff.source"),
              decision: t("tariff.decision"),
              none: t("tariff.none"),
            }}
          />
          <PucslGenerationMixSpark
            labels={{
              title: t("generationMix.title"),
              subtitle: t("generationMix.subtitle"),
              seed: t("generationMix.seed"),
              hydro: t("generationMix.hydro"),
              asOf: t("generationMix.asOf"),
              honesty: t("generationMix.honesty"),
              source: t("generationMix.source"),
            }}
          />
        </div>
      </section>

      <RemittanceBoard
        snapshot={remittanceTt}
        labels={{
          title: t("remittanceBoard.title"),
          subtitle: t("remittanceBoard.subtitle"),
          bank: t("remittanceBoard.bank"),
          buy: t("remittanceBoard.buy"),
          sell: t("remittanceBoard.sell"),
          spread: t("remittanceBoard.spread"),
          bestBuy: t("remittanceBoard.bestBuy"),
          bestSell: t("remittanceBoard.bestSell"),
          seed: t("remittanceBoard.seed"),
          bankSeed: t("remittanceBoard.bankSeed"),
          asOf: t("remittanceBoard.asOf"),
          source: t("remittanceBoard.source"),
          honesty: t("remittanceBoard.honesty"),
        }}
      />

      <SupermarketCardDays />

      <RemittanceCalculator rates={latestFxRate} />

      <CseMarketCard
        snapshot={cseSnapshot}
        labels={{
          title: t("cse.title"),
          subtitle: t("cse.subtitle"),
          sourceName: t("cse.sourceName"),
          aspi: t("cse.aspi"),
          snp: t("cse.snp"),
          gainers: t("cse.gainers"),
          losers: t("cse.losers"),
          marketStatus: t("cse.marketStatus"),
          trades: t("cse.trades"),
          shareVolume: t("cse.shareVolume"),
          turnover: t("cse.turnover"),
          fallbackNote: t("cse.fallbackNote"),
          noMovers: t("cse.noMovers"),
          sectors: t("cse.sectors"),
          mostActive: t("cse.mostActive"),
          foreign: t("cse.foreign"),
          domesticTrades: t("cse.domesticTrades"),
          foreignTrades: t("cse.foreignTrades"),
          foreignBuy: t("cse.foreignBuy"),
          foreignSell: t("cse.foreignSell"),
          noSectors: t("cse.noSectors"),
          sectorsSkipped: t("cse.sectorsSkipped"),
          noActive: t("cse.noActive"),
          highLow: t("cse.highLow"),
          notices: t("cse.notices"),
          noNotices: t("cse.noNotices"),
        }}
      />

      <MarketsPressStrip locale={locale} />
    </div>
  );
}
