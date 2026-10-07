import { getTranslations, setRequestLocale } from "next-intl/server";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import {
  FuelHistoryChart,
  FuelRevisionSteps,
} from "@/components/EconomyCards";
import { WorldPumpCompare } from "@/components/WorldPumpCompare";
import { Link } from "@/i18n/navigation";
import { getLatestFxRate } from "@/lib/economy";
import { getFuelHistorySeries, getFuelRevisionSteps } from "@/lib/fuel";
import { computeFreshnessTier } from "@/lib/freshness";
import {
  fetchOctanePrices,
  pickCpcPrice,
} from "@/lib/integrations/octane";
import { getSource, getSourceProvenancePath } from "@/lib/sources";
import type { FreshnessTier } from "@/lib/types";
import { getWorldPumpSnapshot } from "@/lib/world-pump";

const FUEL_ORDER = [
  "petrol_92",
  "petrol_95",
  "auto_diesel",
  "super_diesel",
  "kerosene",
] as const;

interface CurrentFuelPrice {
  fuelType: string;
  priceLkr: number;
  recordedAt: string;
}

interface CurrentFuelSnapshot {
  prices: CurrentFuelPrice[];
  observedAt: string;
  tier: FreshnessTier;
  isFallback: boolean;
}

const FALLBACK_PRICES: Record<string, number> = {
  petrol_92: 414,
  auto_diesel: 382,
};
const FALLBACK_DATE = "2026-06-30";

async function getCurrentFuelPrices(): Promise<CurrentFuelSnapshot> {
  const cadenceMinutes = getSource("octane_fuel")?.cadenceMinutes ?? 10080;
  try {
    const data = await fetchOctanePrices();
    const prices: CurrentFuelPrice[] = [];
    for (const fuelType of FUEL_ORDER) {
      const match = pickCpcPrice(data.prices, fuelType);
      if (match) {
        prices.push({
          fuelType,
          priceLkr: match.price_lkr,
          recordedAt: match.recorded_at,
        });
      }
    }
    if (prices.length === 0) {
      throw new Error("Octane returned no CPC prices");
    }
    const observedAt = prices[0].recordedAt;
    return {
      prices,
      observedAt,
      tier: computeFreshnessTier(observedAt, cadenceMinutes),
      isFallback: false,
    };
  } catch {
    const prices = Object.entries(FALLBACK_PRICES).map(
      ([fuelType, priceLkr]) => ({
        fuelType,
        priceLkr,
        recordedAt: FALLBACK_DATE,
      }),
    );
    return {
      prices,
      observedAt: FALLBACK_DATE,
      tier: computeFreshnessTier(FALLBACK_DATE, cadenceMinutes),
      isFallback: true,
    };
  }
}

export default async function FuelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("fuel");

  const source = getSource("octane_fuel");
  const [current, fuelHistory, fuelRevisions, latestFxRate] = await Promise.all(
    [
      getCurrentFuelPrices(),
      getFuelHistorySeries(90),
      getFuelRevisionSteps(8),
      getLatestFxRate(),
    ],
  );

  const petrol92 = current.prices.find(
    (price) => price.fuelType === "petrol_92",
  );
  const worldPump = await getWorldPumpSnapshot({
    sriLankaPetrolLkr: petrol92 ? petrol92.priceLkr : null,
    usdLkr: latestFxRate?.sellRate ?? null,
  });

  const labelFor = (fuelType: string) =>
    t.has(`fuelTypes.${fuelType}`) ? t(`fuelTypes.${fuelType}`) : fuelType;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>
            {t("asOf", { date: current.observedAt })} ·{" "}
            <Link
              href={getSourceProvenancePath("octane_fuel")}
              className="text-teal-300 hover:text-teal-200"
            >
              {source?.name ?? "Octane Fuel API"}
            </Link>
          </span>
          <FreshnessBadge tier={current.tier} />
        </p>
      </div>

      {current.isFallback ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-300">
            {t("fallbackNotice", { date: current.observedAt })}
          </p>
        </div>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {t("currentTitle")}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{t("currentSubtitle")}</p>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {current.prices.map((price) => (
            <div
              key={price.fuelType}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <dt className="flex items-center justify-between gap-2 text-sm text-slate-500">
                <span>{labelFor(price.fuelType)}</span>
                <FreshnessBadge tier={current.tier} />
              </dt>
              <dd className="mt-2 text-3xl font-semibold text-white">
                {price.priceLkr.toFixed(0)}{" "}
                <span className="text-base font-normal text-slate-400">
                  {t("perLitre")}
                </span>
              </dd>
              <dd className="mt-1 text-xs text-slate-500">
                {t("observed", { date: price.recordedAt })}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {t("historyTitle")}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{t("historySubtitle")}</p>
        </div>
        <div className="grid gap-4">
          <FuelHistoryChart
            title={t("historyTitle")}
            series={fuelHistory.map((series) => ({
              ...series,
              label: labelFor(series.fuelType),
            }))}
            chartId="fuel-page-history-chart"
            citation={{
              sourceName: source?.name ?? "Octane Fuel API",
              sourcePath: getSourceProvenancePath("octane_fuel"),
              permalink: `/${locale}/fuel`,
            }}
          />
        </div>
      </section>

      <section className="space-y-4">
        <FuelRevisionSteps
          title={t("revisionsTitle")}
          subtitle={t("revisionsSubtitle")}
          steps={fuelRevisions.map((step) => ({
            ...step,
            label: labelFor(step.fuelType),
          }))}
          labels={{
            date: t("revisionsDate"),
            from: t("revisionsFrom"),
            to: t("revisionsTo"),
            empty: t("revisionsEmpty"),
          }}
        />
      </section>

      <section className="space-y-4">
        <WorldPumpCompare
          snapshot={worldPump}
          labels={{
            title: t("pump.title"),
            subtitle: t("pump.subtitle"),
            seedBadge: t("pump.seedBadge"),
            liveBadge: t("pump.liveBadge"),
            asOf: t.raw("pump.asOf"),
            methodology: t("pump.methodology"),
            empty: t("pump.empty"),
            worldAvg: t.raw("pump.worldAvg"),
          }}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-white">
          {t("methodologyTitle")}
        </h2>
        <p className="max-w-3xl text-sm text-slate-400">
          {t("methodologyBody")}
        </p>
        <p className="max-w-3xl text-sm text-slate-500">{t("disclaimer")}</p>
      </section>
    </div>
  );
}
