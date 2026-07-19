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

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2 lg:col-span-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{labels.title}</p>
          <p className="mt-1 text-xs text-slate-500">{labels.subtitle}</p>
        </div>
        <p className="text-xs text-slate-500">
          {labels.asOf.replace("{date}", snapshot.asOf)}
        </p>
      </div>

      <ul className="mt-5 space-y-3" role="list">
        {snapshot.peers.map((peer) => (
          <li key={peer.id}>
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-white">{peer.name}</span>
                <span className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                  {peer.live ? labels.liveBadge : labels.seedBadge}
                </span>
              </div>
              <span className="text-sm text-slate-200">
                {peer.petrolUsdPerLitre.toFixed(2)} {snapshot.unit}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={
                  peer.isSriLanka
                    ? "h-full rounded-full bg-white"
                    : "h-full rounded-full bg-slate-500"
                }
                style={{
                  width: `${Math.max(
                    (peer.petrolUsdPerLitre / max) * 100,
                    4,
                  )}%`,
                }}
              />
            </div>
            {peer.note ? (
              <p className="mt-1 text-xs text-slate-500">{peer.note}</p>
            ) : null}
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
