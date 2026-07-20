import { MonoLineChart } from "@/components/charts/MonoLineChart";
import {
  buildListingCountSeries,
  listingCountDeltaPct,
} from "@/lib/property-listings";
import type { PropertySnapshot } from "@/lib/types";

export function PropertyListingSpark({
  snapshot,
  labels,
}: {
  snapshot: PropertySnapshot;
  labels: {
    title: string;
    subtitle: string;
    seed: string;
    delta: string;
    honesty: string;
  };
}) {
  const { series, listingCount, isSeed } = buildListingCountSeries(snapshot);
  const delta = listingCountDeltaPct(series);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2 lg:col-span-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-500">{labels.title}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-white">
            {listingCount.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-neutral-400">{labels.subtitle}</p>
        </div>
        <div className="text-right text-sm">
          {isSeed ? (
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

      {series.length >= 2 ? (
        <div className="mt-4">
          <MonoLineChart
            id="property-listing-count-spark"
            ariaLabel={labels.title}
            series={[
              {
                id: "listings",
                values: series,
                area: true,
                className: "text-white",
              },
            ]}
            height={96}
            valueFormat={(value) =>
              value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)
            }
          />
        </div>
      ) : null}

      <p className="mt-3 text-xs text-neutral-500">{labels.honesty}</p>
    </article>
  );
}
