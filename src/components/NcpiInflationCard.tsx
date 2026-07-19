"use client";

import { ChartExportButton } from "@/components/ChartExportButton";
import { MonoLineChart } from "@/components/charts/MonoLineChart";
import { CitationCard } from "@/components/CitationCard";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import type { NcpiSnapshot } from "@/lib/ncpi";

export function NcpiInflationCard({
  snapshot,
  labels,
  sourcePath,
  permalink,
}: {
  snapshot: NcpiSnapshot;
  labels: {
    title: string;
    subtitle: string;
    yoy: string;
    mom: string;
    core: string;
    food: string;
    nonFood: string;
    index: string;
    period: string;
    honesty: string;
    source: string;
    release: string;
  };
  sourcePath: string;
  permalink?: string;
}) {
  const { latest, series } = snapshot;
  const chartId = "ncpi-yoy-chart";

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2 lg:col-span-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{labels.title}</h3>
            <FreshnessBadge tier="stale" />
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            {labels.subtitle}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {labels.period}: {snapshot.periodLabel} · {snapshot.base}
          </p>
        </div>
        <ChartExportButton targetId={chartId} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
          <p className="text-xs text-slate-500">{labels.yoy}</p>
          <p className="mt-1 text-3xl font-semibold text-white">
            {latest.yoyPct.toFixed(1)}
            <span className="ml-1 text-base font-normal text-slate-400">%</span>
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
          <p className="text-xs text-slate-500">{labels.mom}</p>
          <p className="mt-1 text-3xl font-semibold text-white">
            {latest.momPct > 0 ? "+" : ""}
            {latest.momPct.toFixed(1)}
            <span className="ml-1 text-base font-normal text-slate-400">%</span>
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
          <p className="text-xs text-slate-500">{labels.index}</p>
          <p className="mt-1 text-3xl font-semibold text-white">
            {latest.index.toFixed(1)}
          </p>
        </div>
      </div>

      <dl className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
        <div>
          <dt className="text-slate-500">{labels.core}</dt>
          <dd className="mt-0.5 font-medium text-white">
            {latest.coreYoyPct.toFixed(1)}%
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">{labels.food}</dt>
          <dd className="mt-0.5 font-medium text-white">
            {latest.foodYoyPct.toFixed(1)}%
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">{labels.nonFood}</dt>
          <dd className="mt-0.5 font-medium text-white">
            {latest.nonFoodYoyPct.toFixed(1)}%
          </dd>
        </div>
      </dl>

      <div className="mt-4 overflow-x-auto">
        <MonoLineChart
          id={chartId}
          ariaLabel={labels.yoy}
          height={128}
          showZeroLine
          startLabel={series[0]?.label}
          endLabel={series[series.length - 1]?.label}
          valueFormat={(value) => `${value.toFixed(1)}%`}
          series={[
            {
              id: "ncpi-yoy",
              className: "text-white",
              area: true,
              values: series.map((point) => ({
                date: `${point.period}-01`,
                value: point.yoyPct,
              })),
            },
          ]}
        />
      </div>

      <footer className="mt-4 space-y-3 border-t border-white/10 pt-4">
        <p className="text-xs text-slate-500">{labels.honesty}</p>
        <p className="text-xs text-slate-500">
          <Link
            href={sourcePath}
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {labels.source}
          </Link>
          {" · "}
          <a
            href={snapshot.releaseUrl}
            target="_blank"
            rel="noreferrer"
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {labels.release}
          </a>
        </p>
        <CitationCard
          title={`${labels.title} (${snapshot.periodLabel})`}
          value={`${latest.yoyPct.toFixed(1)}% YoY`}
          observedAt={snapshot.asOf}
          sourceName={snapshot.sourceName}
          sourcePath={sourcePath}
          permalink={permalink}
        />
      </footer>
    </article>
  );
}
