import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import type { LpgPriceSnapshot } from "@/lib/integrations/lpg";
import type { FreshnessTier } from "@/lib/types";

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
}: {
  title: string;
  series: Array<{ date: string; sellRate: number }>;
  asOf: string;
  latestBand?: { date: string; buyRate: number; sellRate: number };
  labels: {
    bandTitle: string;
    buy: string;
    sell: string;
  };
}) {
  if (series.length === 0) {
    return null;
  }

  const rates = series.map((point) => point.sellRate);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const range = max - min || 1;
  const latest = series[series.length - 1];
  const first = series[0];
  const change = latest.sellRate - first.sellRate;
  const band = latestBand ?? {
    date: latest.date,
    buyRate: latest.sellRate,
    sellRate: latest.sellRate,
  };

  const points = series
    .map((point, index) => {
      const x = (index / Math.max(series.length - 1, 1)) * 100;
      const y = 100 - ((point.sellRate - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2 lg:col-span-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {band.sellRate.toFixed(2)}{" "}
            <span className="text-base font-normal text-slate-400">LKR</span>
          </p>
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
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="mt-4 h-24 w-full"
        role="img"
        aria-label={title}
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-slate-200"
          points={points}
        />
      </svg>
      <p className="mt-2 text-xs text-slate-500">
        {first.date} → {latest.date} · {asOf} · {band.date}
      </p>
    </article>
  );
}

export function FuelHistoryChart({
  title,
  series,
}: {
  title: string;
  series: Array<{ fuelType: string; label: string; points: Array<{ recorded_at: string; price_lkr: number }> }>;
}) {
  const validSeries = series.filter((item) => item.points.length >= 2);
  if (validSeries.length === 0) {
    return null;
  }

  const allPrices = validSeries.flatMap((item) =>
    item.points.map((point) => point.price_lkr),
  );
  const min = Math.min(...allPrices);
  const max = Math.max(...allPrices);
  const range = max - min || 1;

  const lineStyles = [
    { className: "text-white", dash: undefined, label: "solid" },
    { className: "text-slate-400", dash: "4 4", label: "dashed" },
  ] as const;

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
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="mt-4 h-28 w-full"
        role="img"
        aria-label={title}
      >
        {validSeries.map((item, seriesIndex) => {
          const points = item.points
            .map((point, index) => {
              const x =
                (index / Math.max(item.points.length - 1, 1)) * 100;
              const y = 100 - ((point.price_lkr - min) / range) * 100;
              return `${x},${y}`;
            })
            .join(" ");
          const style = lineStyles[seriesIndex % lineStyles.length];
          return (
            <polyline
              key={item.fuelType}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={style.dash}
              className={style.className}
              points={points}
            />
          );
        })}
      </svg>
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
