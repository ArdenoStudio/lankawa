"use client";

import { ChartExportButton } from "@/components/ChartExportButton";
import { CitationCard } from "@/components/CitationCard";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import type { ForeignDebtSnapshot } from "@/lib/foreign-debt";

export function DebtCompositionCard({
  snapshot,
  labels,
  sourcePath,
  permalink,
}: {
  snapshot: ForeignDebtSnapshot;
  labels: {
    title: string;
    subtitle: string;
    commercial: string;
    concessionary: string;
    latest: string;
    delta: string;
    asOf: string;
    attribution: string;
    methodology: string;
  };
  sourcePath: string;
  permalink?: string;
}) {
  const { series, latest, commercialDeltaPts } = snapshot;
  const width = 360;
  const height = 140;
  const padX = 12;
  const padY = 16;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const commercialPoints = series
    .map((point, index) => {
      const x = padX + (index / Math.max(series.length - 1, 1)) * innerW;
      const y = padY + ((100 - point.commercialPct) / 100) * innerH;
      return `${x},${y}`;
    })
    .join(" ");

  const concessionaryPoints = series
    .map((point, index) => {
      const x = padX + (index / Math.max(series.length - 1, 1)) * innerW;
      const y = padY + ((100 - point.concessionaryPct) / 100) * innerH;
      return `${x},${y}`;
    })
    .join(" ");

  const chartId = "foreign-debt-composition-chart";

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
        </div>
        <ChartExportButton targetId={chartId} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
          <p className="text-xs text-slate-500">{labels.latest}</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {latest.commercialPct.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500">{labels.commercial}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
          <p className="text-xs text-slate-500">{labels.latest}</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {latest.concessionaryPct.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500">{labels.concessionary}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
          <p className="text-xs text-slate-500">{labels.delta}</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {commercialDeltaPts > 0 ? "+" : ""}
            {commercialDeltaPts.toFixed(1)}
            <span className="ml-1 text-base font-normal text-slate-400">pp</span>
          </p>
          <p className="text-xs text-slate-500">
            {snapshot.earliest.year}→{latest.year} {labels.commercial}
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg
          id={chartId}
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full max-w-2xl text-white"
          role="img"
          aria-label={labels.title}
        >
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity={0.95}
            points={commercialPoints}
          />
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 3"
            opacity={0.55}
            points={concessionaryPoints}
          />
          <text
            x={padX}
            y={height - 2}
            className="fill-current text-[10px]"
            fill="currentColor"
            opacity={0.5}
          >
            {snapshot.earliest.year}
          </text>
          <text
            x={width - padX}
            y={height - 2}
            textAnchor="end"
            className="fill-current text-[10px]"
            fill="currentColor"
            opacity={0.5}
          >
            {latest.year}
          </text>
        </svg>
        <p className="mt-2 text-xs text-slate-500">
          <span className="mr-3">— {labels.commercial}</span>
          <span className="opacity-70">- - {labels.concessionary}</span>
        </p>
      </div>

      <footer className="mt-4 space-y-3 border-t border-white/10 pt-4">
        <p className="text-xs text-slate-500">
          {labels.asOf} ·{" "}
          <Link
            href={sourcePath}
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {snapshot.sourceName}
          </Link>
        </p>
        <p className="text-xs leading-relaxed text-slate-500">
          {labels.attribution}{" "}
          <a
            href={snapshot.attribution.discoveryUrl}
            target="_blank"
            rel="noreferrer"
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {snapshot.attribution.discovery}
          </a>
          . {labels.methodology}
        </p>
        <CitationCard
          title={labels.title}
          value={`${latest.commercialPct.toFixed(1)}% commercial (${latest.year})`}
          observedAt={snapshot.asOf}
          sourceName={snapshot.sourceName}
          sourcePath={sourcePath}
          permalink={permalink}
        />
      </footer>
    </article>
  );
}
