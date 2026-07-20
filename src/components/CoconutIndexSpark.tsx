import { MonoLineChart } from "@/components/charts/MonoLineChart";
import {
  coconutDeltaPct,
  getCoconutHistorySnapshot,
  getCoconutSparkSeries,
} from "@/lib/coconut-history";

export function CoconutIndexSpark({
  labels,
}: {
  labels: {
    title: string;
    subtitle: string;
    seed: string;
    delta: string;
    honesty: string;
    empty: string;
  };
}) {
  const snapshot = getCoconutHistorySnapshot();
  const series = getCoconutSparkSeries(30, snapshot);
  const delta = coconutDeltaPct(series);
  const latest = series[series.length - 1];

  if (series.length < 2 || !latest) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-500">
        {labels.empty}
      </p>
    );
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-500">{labels.title}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-white">
            LKR {latest.value.toLocaleString()}
            <span className="ml-2 text-base font-normal text-neutral-400">
              /{snapshot.itemUnit}
            </span>
          </p>
          <p className="mt-1 text-sm text-neutral-400">{labels.subtitle}</p>
        </div>
        <div className="text-right text-sm">
          {snapshot.isSeed ? (
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              {labels.seed}
            </p>
          ) : null}
          {delta != null ? (
            <p className="mt-1 tabular-nums text-white">
              {labels.delta.replace(
                "{pct}",
                `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}`,
              )}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <MonoLineChart
          id="coconut-index-history-spark"
          ariaLabel={labels.title}
          series={[
            {
              id: "coconut",
              values: series,
              area: true,
              className: "text-white",
            },
          ]}
          height={96}
          valueFormat={(value) => value.toFixed(0)}
        />
      </div>
      <p className="mt-3 text-xs text-neutral-500">{labels.honesty}</p>
    </article>
  );
}
