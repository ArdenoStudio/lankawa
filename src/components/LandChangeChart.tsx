"use client";

import { ChartExportButton } from "@/components/ChartExportButton";
import { CitationCard } from "@/components/CitationCard";
import type { LandChangeDistrict } from "@/lib/land-change";

export function LandChangeChart({
  rows,
  labels,
  citation,
  chartId = "land-change-greenery-chart",
}: {
  rows: LandChangeDistrict[];
  labels: {
    title: string;
    greeneryDelta: string;
    exportHint: string;
  };
  citation: {
    title: string;
    value: string;
    observedAt: string;
    sourceName: string;
    sourcePath: string;
    permalink?: string;
  };
  chartId?: string;
}) {
  if (rows.length === 0) {
    return null;
  }

  const maxLoss = Math.max(
    ...rows.map((row) => Math.abs(row.greeneryDelta)),
    1,
  );
  const barHeight = 18;
  const gap = 10;
  const chartHeight = rows.length * (barHeight + gap) + 20;
  const labelWidth = 110;
  const chartWidth = 360;

  return (
    <article className="rounded-2xl border border-white/15 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{labels.title}</h3>
          <p className="mt-1 text-xs text-neutral-500">{labels.exportHint}</p>
        </div>
        <ChartExportButton targetId={chartId} />
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg
          id={chartId}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-auto w-full max-w-xl text-white"
          role="img"
          aria-label={labels.title}
        >
          {rows.map((row, index) => {
            const y = 8 + index * (barHeight + gap);
            const width = (Math.abs(row.greeneryDelta) / maxLoss) * 200;
            return (
              <g key={row.slug}>
                <text
                  x={0}
                  y={y + barHeight / 2 + 4}
                  className="fill-current text-[11px]"
                  fill="currentColor"
                >
                  {row.slug}
                </text>
                <rect
                  x={labelWidth}
                  y={y}
                  width={width}
                  height={barHeight}
                  fill="currentColor"
                  opacity={0.85}
                />
                <text
                  x={labelWidth + width + 8}
                  y={y + barHeight / 2 + 4}
                  className="fill-current text-[11px]"
                  fill="currentColor"
                >
                  {row.greeneryDelta}
                </text>
              </g>
            );
          })}
          <text
            x={labelWidth}
            y={chartHeight - 2}
            className="fill-current text-[10px]"
            fill="currentColor"
            opacity={0.55}
          >
            {labels.greeneryDelta}
          </text>
        </svg>
      </div>

      <div className="mt-4">
        <CitationCard
          title={citation.title}
          value={citation.value}
          observedAt={citation.observedAt}
          sourceName={citation.sourceName}
          sourcePath={citation.sourcePath}
          permalink={citation.permalink}
        />
      </div>
    </article>
  );
}
