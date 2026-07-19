import { ChartExportButton } from "@/components/ChartExportButton";
import { Link } from "@/i18n/navigation";
import type { WorldPumpSnapshot } from "@/lib/world-pump";

export function WorldPumpCompare({
  snapshot,
  labels,
}: {
  snapshot: WorldPumpSnapshot;
  labels: {
    title: string;
    subtitle: string;
    seedBadge: string;
    liveBadge: string;
    asOf: string;
    methodology: string;
    empty: string;
  };
}) {
  if (snapshot.peers.length === 0) {
    return (
      <article className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2 lg:col-span-3">
        <p className="text-sm text-slate-500">{labels.title}</p>
        <p className="mt-2 text-sm text-slate-400">{labels.empty}</p>
      </article>
    );
  }

  const max = Math.max(
    ...snapshot.peers.map((peer) => peer.petrolUsdPerLitre),
    0.01,
  );
  const chartId = "world-pump-compare-chart";
  const labelWidth = 88;
  const barMax = 220;
  const rowH = 28;
  const padTop = 8;
  const width = labelWidth + barMax + 72;
  const height = padTop + snapshot.peers.length * rowH + 8;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2 lg:col-span-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{labels.title}</p>
          <p className="mt-1 text-xs text-slate-500">{labels.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-slate-500">
            {labels.asOf.replace("{date}", snapshot.asOf)}
          </p>
          <ChartExportButton targetId={chartId} />
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <svg
          id={chartId}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-auto w-full max-w-2xl text-white"
          role="img"
          aria-label={labels.title}
        >
          {snapshot.peers.map((peer, index) => {
            const y = padTop + index * rowH;
            const barWidth = Math.max(
              (peer.petrolUsdPerLitre / max) * barMax,
              6,
            );
            return (
              <g key={peer.id}>
                <text
                  x={0}
                  y={y + 14}
                  className="fill-current text-[11px]"
                  fill="currentColor"
                  opacity={peer.isSriLanka ? 1 : 0.75}
                >
                  {peer.name}
                </text>
                <rect
                  x={labelWidth}
                  y={y + 4}
                  width={barMax}
                  height={12}
                  fill="currentColor"
                  opacity={0.08}
                  rx={2}
                />
                <rect
                  x={labelWidth}
                  y={y + 4}
                  width={barWidth}
                  height={12}
                  fill="currentColor"
                  opacity={peer.isSriLanka ? 0.95 : 0.45}
                  rx={2}
                />
                <text
                  x={labelWidth + barMax + 8}
                  y={y + 14}
                  className="fill-current text-[11px]"
                  fill="currentColor"
                  opacity={0.85}
                >
                  {peer.petrolUsdPerLitre.toFixed(2)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        {snapshot.peers.map((peer) => (
          <li key={`${peer.id}-meta`}>
            <span className="text-slate-400">{peer.name}</span>
            {" · "}
            {peer.live ? labels.liveBadge : labels.seedBadge}
            {peer.note ? ` · ${peer.note}` : null}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-slate-500">
        {labels.methodology}{" "}
        <Link
          href={snapshot.provenancePath}
          className="text-white underline decoration-white/30 hover:decoration-white"
        >
          {snapshot.sourceName}
        </Link>
        {" · "}
        {snapshot.methodologyNote}
      </p>
    </article>
  );
}
