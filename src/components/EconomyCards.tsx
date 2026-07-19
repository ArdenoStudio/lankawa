import { FreshnessBadge } from "@/components/FreshnessBadge";
import type { FreshnessTier } from "@/lib/types";

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
}: {
  title: string;
  series: Array<{ date: string; sellRate: number }>;
  asOf: string;
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
            {latest.sellRate.toFixed(2)}{" "}
            <span className="text-base font-normal text-slate-400">LKR</span>
          </p>
        </div>
        <p
          className={`text-sm font-medium ${
            change >= 0 ? "text-rose-300" : "text-teal-300"
          }`}
        >
          {change >= 0 ? "+" : ""}
          {change.toFixed(2)} over {series.length} days
        </p>
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
          className="text-teal-400"
          points={points}
        />
      </svg>
      <p className="mt-2 text-xs text-slate-500">
        {first.date} → {latest.date} · {asOf}
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

  const colors = ["text-teal-400", "text-amber-400"];

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2 lg:col-span-3">
      <p className="text-sm text-slate-500">{title}</p>
      <div className="mt-3 flex flex-wrap gap-4">
        {validSeries.map((item, index) => {
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
                className={`text-xs font-medium ${
                  change >= 0 ? "text-rose-300" : "text-teal-300"
                }`}
              >
                {change >= 0 ? "+" : ""}
                {change.toFixed(0)} since {first.recorded_at}
              </p>
            </div>
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
          return (
            <polyline
              key={item.fuelType}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={colors[seriesIndex % colors.length]}
              points={points}
            />
          );
        })}
      </svg>
    </article>
  );
}
