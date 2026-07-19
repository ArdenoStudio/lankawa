import { ChartExportButton } from "@/components/ChartExportButton";
import { MonoLineChart } from "@/components/charts/MonoLineChart";
import { CitationCard } from "@/components/CitationCard";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import type { FxAnomalyResult } from "@/lib/fx-anomaly";
import type { FuelHistorySeries, FuelRevisionStep } from "@/lib/fuel";
import type { LpgPriceSnapshot } from "@/lib/integrations/lpg";
import type { FreshnessTier } from "@/lib/types";

interface ChartCitation {
  sourceName: string;
  sourcePath: string;
  permalink?: string;
}

function formatDirectionalDelta(value: number, fractionDigits: number): string {
  const direction = value > 0 ? "↑" : value < 0 ? "↓" : "→";
  const sign = value > 0 ? "+" : "";
  return `${direction} ${sign}${value.toFixed(fractionDigits)}`;
}

export function MacroIndicatorCard({
  label,
  value,
  unit,
  period,
  tier = "unknown",
}: {
  label: string;
  value: number;
  unit: string;
  period: string;
  tier?: FreshnessTier;
}) {
  const formatted =
    unit === "%" || unit === "USD bn"
      ? value.toFixed(1)
      : value.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        <FreshnessBadge tier={tier} />
      </div>
      <p className="mt-2 text-3xl font-semibold text-white">
        {formatted}
        <span className="ml-1 text-lg font-normal text-slate-400">{unit}</span>
      </p>
      <p className="mt-1 text-xs text-slate-500">{period}</p>
    </article>
  );
}

export function FxSparkline({
  title,
  series,
  asOf,
  latestBand,
  labels,
  anomaly,
  chartId = "fx-sparkline-chart",
  citation,
}: {
  title: string;
  series: Array<{ date: string; sellRate: number }>;
  asOf: string;
  latestBand?: {
    date: string;
    buyRate: number;
    sellRate: number;
    observedAt?: string;
  };
  labels: {
    bandTitle: string;
    buy: string;
    sell: string;
    anomaly?: string;
    anomalyQuiet?: string;
  };
  anomaly?: FxAnomalyResult;
  chartId?: string;
  citation?: ChartCitation;
}) {
  if (series.length === 0) {
    return null;
  }

  const latest = series[series.length - 1];
  const first = series[0];
  const change = latest.sellRate - first.sellRate;
  const band = latestBand ?? {
    date: latest.date,
    buyRate: latest.sellRate,
    sellRate: latest.sellRate,
  };
  const observedAt = latestBand?.observedAt ?? band.date;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2 lg:col-span-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {band.sellRate.toFixed(2)}{" "}
            <span className="text-base font-normal text-slate-400">LKR</span>
          </p>
          {anomaly && labels.anomaly ? (
            <p
              className={
                anomaly.unusual
                  ? "mt-1 text-xs font-medium text-white"
                  : "mt-1 text-xs text-slate-500"
              }
            >
              {anomaly.unusual
                ? `${labels.anomaly}${
                    anomaly.madZ != null
                      ? ` · z≈${anomaly.madZ.toFixed(1)}`
                      : ""
                  }`
                : labels.anomalyQuiet ?? labels.anomaly}
            </p>
          ) : null}
        </div>
        <p className="text-sm font-medium text-slate-300">
          {formatDirectionalDelta(change, 2)} over {series.length} days
        </p>
      </div>
      <div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-black/15 p-3 sm:grid-cols-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 sm:col-span-2">
          {labels.bandTitle}
        </p>
        <div>
          <p className="text-xs text-slate-500">{labels.buy}</p>
          <p className="text-lg font-semibold text-white">
            {band.buyRate.toFixed(2)}{" "}
            <span className="text-xs font-normal text-slate-400">LKR</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">{labels.sell}</p>
          <p className="text-lg font-semibold text-white">
            {band.sellRate.toFixed(2)}{" "}
            <span className="text-xs font-normal text-slate-400">LKR</span>
          </p>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <MonoLineChart
          id={chartId}
          ariaLabel={title}
          height={110}
          valueFormat={(value) => value.toFixed(2)}
          series={[
            {
              id: "usd-lkr-sell",
              values: series.map((point) => ({
                date: point.date,
                value: point.sellRate,
              })),
              className: "text-slate-100",
              area: true,
            },
          ]}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {first.date} → {latest.date} · {asOf} · {band.date}
        </p>
        <ChartExportButton targetId={chartId} />
      </div>
      {citation ? (
        <CitationCard
          className="mt-4"
          title={title}
          value={band.sellRate.toFixed(2)}
          unit="LKR"
          observedAt={observedAt}
          sourceName={citation.sourceName}
          sourcePath={citation.sourcePath}
          permalink={citation.permalink}
        />
      ) : null}
    </article>
  );
}

export function FuelRevisionSteps({
  title,
  subtitle,
  steps,
  labels,
}: {
  title: string;
  subtitle: string;
  steps: FuelRevisionStep[];
  labels: {
    date: string;
    from: string;
    to: string;
    empty: string;
  };
}) {
  if (steps.length === 0) {
    return (
      <article className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2 lg:col-span-3">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="mt-2 text-sm text-slate-400">{labels.empty}</p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2 lg:col-span-3">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      <ol className="mt-4 space-y-3">
        {steps.map((step) => (
          <li
            key={`${step.fuelType}-${step.recordedAt}-${step.priceLkr}`}
            className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/5 pb-3 last:border-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-medium text-white">{step.label}</p>
              <p className="text-xs text-slate-500">
                {labels.date}: {step.recordedAt} · {labels.from}{" "}
                {step.previousLkr.toFixed(0)} → {labels.to}{" "}
                {step.priceLkr.toFixed(0)} LKR/L
              </p>
            </div>
            <p className="text-sm font-medium text-slate-300">
              {formatDirectionalDelta(step.deltaLkr, 0)} (
              {formatDirectionalDelta(step.deltaPct, 1)}%)
            </p>
          </li>
        ))}
      </ol>
    </article>
  );
}

export function FuelHistoryChart({
  title,
  series,
  chartId = "fuel-history-chart",
  citation,
}: {
  title: string;
  series: FuelHistorySeries[];
  chartId?: string;
  citation?: ChartCitation;
}) {
  const validSeries = series.filter((item) => item.points.length >= 2);
  if (validSeries.length === 0) {
    return null;
  }

  const lineStyles = [
    { className: "text-white", dash: undefined, label: "solid" },
    { className: "text-slate-400", dash: "4 4", label: "dashed" },
  ] as const;
  const latestPoints = validSeries.map((item) => ({
    item,
    latest: item.points[item.points.length - 1],
  }));
  const latestObservedAt = latestPoints.reduce(
    (latest, current) =>
      current.latest.recorded_at > latest ? current.latest.recorded_at : latest,
    latestPoints[0]?.latest.recorded_at ?? "",
  );
  const citationValue = latestPoints
    .map(({ item, latest }) => `${item.label} ${latest.price_lkr.toFixed(0)}`)
    .join("; ");

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2 lg:col-span-3">
      <p className="text-sm text-slate-500">{title}</p>
      <div className="mt-3 flex flex-wrap gap-4">
        {validSeries.map((item) => {
          const latest = item.points[item.points.length - 1];
          const first = item.points[0];
          const change = latest.price_lkr - first.price_lkr;
          return (
            <div key={item.fuelType}>
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="text-xl font-semibold text-white">
                {latest.price_lkr.toFixed(0)}{" "}
                <span className="text-sm font-normal text-slate-400">LKR/L</span>
              </p>
              <p
                className="text-xs font-medium text-slate-300"
              >
                {formatDirectionalDelta(change, 0)} since {first.recorded_at}
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
        {validSeries.map((item, index) => {
          const style = lineStyles[index % lineStyles.length];
          return (
            <span key={item.fuelType} className="inline-flex items-center gap-2">
              <span
                className={`inline-block w-7 border-t-2 ${style.className}`}
                style={{ borderStyle: style.dash ? "dashed" : "solid" }}
                aria-hidden="true"
              />
              {item.label} ({style.label})
            </span>
          );
        })}
      </div>
      <div className="mt-4 overflow-x-auto">
        <MonoLineChart
          id={chartId}
          ariaLabel={title}
          height={132}
          valueFormat={(value) => value.toFixed(0)}
          series={validSeries.map((item, seriesIndex) => {
            const style = lineStyles[seriesIndex % lineStyles.length];
            return {
              id: item.fuelType,
              label: item.label,
              step: true,
              className: style.className,
              dasharray: style.dash,
              values: item.points.map((point) => ({
                date: point.recorded_at,
                value: point.price_lkr,
              })),
            };
          })}
        />
      </div>
      <div className="mt-2 flex justify-end">
        <ChartExportButton targetId={chartId} />
      </div>
      {citation && latestObservedAt ? (
        <CitationCard
          className="mt-4"
          title={title}
          value={citationValue}
          unit="LKR/L"
          observedAt={latestObservedAt}
          sourceName={citation.sourceName}
          sourcePath={citation.sourcePath}
          permalink={citation.permalink}
        />
      ) : null}
    </article>
  );
}

export function LpgPriceCard({
  snapshot,
  labels,
  locale,
}: {
  snapshot: LpgPriceSnapshot;
  labels: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cylinder12_5: string;
    asOf: string;
    source: string;
    seed: string;
  };
  locale: string;
}) {
  const colomboPrices = snapshot.prices
    .filter(
      (price) =>
        price.district.toLowerCase() === "colombo" && price.cylinderKg === 12.5,
    )
    .sort((a, b) => a.provider.localeCompare(b.provider));

  if (colomboPrices.length === 0) {
    return null;
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{labels.eyebrow}</p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            {labels.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500">{labels.subtitle}</p>
        </div>
        <FreshnessBadge tier={snapshot.tier} />
      </div>

      <div className="mt-4 space-y-3">
        {colomboPrices.map((price) => (
          <div
            key={`${price.provider}-${price.district}-${price.cylinderKg}`}
            className="rounded-xl border border-white/10 bg-black/15 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{price.provider}</p>
                <p className="text-xs text-slate-500">{labels.cylinder12_5}</p>
              </div>
              <p className="text-xl font-semibold text-white">
                {price.priceLkr.toLocaleString(locale, {
                  maximumFractionDigits: 0,
                })}
                <span className="ml-1 text-xs font-normal text-slate-400">
                  LKR
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-slate-500">
        <span>
          {labels.asOf}
          {snapshot.isSeed ? ` · ${labels.seed}` : null}
        </span>
        <Link
          href={snapshot.provenancePath}
          className="text-slate-300 hover:text-white"
        >
          {labels.source}
        </Link>
      </footer>
    </article>
  );
}
