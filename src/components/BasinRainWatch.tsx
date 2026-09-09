import type { BasinRainSummary } from "@/lib/integrations/irrigation-gauges";

const MAX_BASINS = 8;

export function BasinRainWatch({
  basinRain,
  heavyRainCount,
  labels,
}: {
  basinRain: BasinRainSummary[];
  heavyRainCount: number;
  labels: {
    title: string;
    heavyChip: string;
    more: string;
    note: string;
  };
}) {
  if (basinRain.length === 0) {
    return null;
  }
  const top = basinRain.slice(0, MAX_BASINS);
  const hidden = basinRain.length - top.length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-white">{labels.title}</p>
        {heavyRainCount > 0 ? (
          <span className="rounded-full border border-rose-400/40 bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-200">
            {labels.heavyChip.replace("{count}", String(heavyRainCount))}
          </span>
        ) : null}
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {top.map((basin) => (
          <li
            key={basin.basin}
            className={
              basin.heavyRainStations > 0
                ? "rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-100"
                : "rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-300"
            }
          >
            <span className="font-medium">{basin.basin}</span>
            <span className="ml-1.5 tabular-nums">
              Σ {basin.rainSumMm.toFixed(0)} mm
            </span>
            {basin.rainMaxMm != null ? (
              <span className="ml-1 text-slate-400 tabular-nums">
                · max {basin.rainMaxMm.toFixed(0)} ({basin.worstGauge})
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <p className="mt-2 text-xs text-slate-500">
          {labels.more.replace("{count}", String(hidden))}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-slate-500">{labels.note}</p>
    </div>
  );
}
