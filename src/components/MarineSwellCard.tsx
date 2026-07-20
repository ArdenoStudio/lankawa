import { FreshnessBadge } from "@/components/FreshnessBadge";
import type { MarineSwellSnapshot } from "@/lib/integrations/marine";

export function MarineSwellCard({
  snapshot,
  labels,
}: {
  snapshot: MarineSwellSnapshot;
  labels: {
    title: string;
    subtitle: string;
    seed: string;
    waveHeight: string;
    wavePeriod: string;
    waveDirection: string;
    honesty: string;
    asOf: string;
  };
}) {
  if (snapshot.error === "Not a coastal district") {
    return null;
  }

  return (
    <section className="space-y-3 rounded-2xl border border-white/15 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            {labels.title}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">{labels.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {snapshot.isSeed ? (
            <span className="text-xs uppercase tracking-wide text-neutral-500">
              {labels.seed}
            </span>
          ) : null}
          <FreshnessBadge tier={snapshot.tier} />
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <dt className="text-xs text-neutral-500">{labels.waveHeight}</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {snapshot.waveHeightM != null ? snapshot.waveHeightM.toFixed(1) : "—"}
            <span className="ml-1 text-sm font-normal text-neutral-400">m</span>
          </dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <dt className="text-xs text-neutral-500">{labels.wavePeriod}</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {snapshot.wavePeriodS != null ? snapshot.wavePeriodS.toFixed(1) : "—"}
            <span className="ml-1 text-sm font-normal text-neutral-400">s</span>
          </dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <dt className="text-xs text-neutral-500">{labels.waveDirection}</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {snapshot.waveDirectionDeg != null
              ? `${snapshot.waveDirectionDeg}°`
              : "—"}
          </dd>
        </div>
      </dl>

      <p className="text-xs text-neutral-500">
        {labels.asOf} · {labels.honesty}
      </p>
    </section>
  );
}
