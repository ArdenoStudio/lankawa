"use client";

import { ChartExportButton } from "@/components/ChartExportButton";
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
  const width = 360;
  const height = 120;
  const padX = 16;
  const padY = 14;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const values = series.map((point) => point.yoyPct);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;

  const points = series
    .map((point, index) => {
      const x = padX + (index / Math.max(series.length - 1, 1)) * innerW;
      const y = padY + ((max - point.yoyPct) / range) * innerH;
      return `${x},${y}`;
    })
    .join(" ");

  const zeroY = padY + ((max - 0) / range) * innerH;

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
        <svg
          id={chartId}
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full max-w-2xl text-white"
          role="img"
          aria-label={labels.yoy}
        >
          <line
            x1={padX}
            y1={zeroY}
            x2={width - padX}
            y2={zeroY}
            stroke="currentColor"
            strokeOpacity={0.25}
            strokeDasharray="3 3"
          />
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            points={points}
          />
          <text
            x={padX}
            y={height - 2}
            className="fill-current text-[10px]"
            fill="currentColor"
            opacity={0.5}
          >
            {series[0]?.label}
          </text>
          <text
            x={width - padX}
            y={height - 2}
            textAnchor="end"
            className="fill-current text-[10px]"
            fill="currentColor"
            opacity={0.5}
          >
            {series[series.length - 1]?.label}
          </text>
        </svg>
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
