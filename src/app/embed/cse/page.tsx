import { buildCseSnapshot } from "@/lib/integrations/cse";

export const dynamic = "force-dynamic";

function formatChange(change: number | null, changePct: number | null): string {
  if (change == null && changePct == null) {
    return "—";
  }
  const value = changePct ?? change ?? 0;
  const arrow = value > 0 ? "↑" : value < 0 ? "↓" : "→";
  if (changePct != null) {
    return `${arrow} ${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`;
  }
  return `${arrow} ${change! >= 0 ? "+" : ""}${change!.toFixed(2)}`;
}

export default async function EmbedCsePage() {
  const snapshot = await buildCseSnapshot();

  return (
    <div className="min-h-screen p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-white">
          Lankawa CSE
        </p>
        <p className="text-[11px] text-slate-500">
          {new Date(snapshot.asOf).toLocaleString("en-LK", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-slate-400">{snapshot.aspi.name}</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {snapshot.aspi.value.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {formatChange(snapshot.aspi.change, snapshot.aspi.changePct)}
          </p>
        </article>
        <article className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-slate-400">{snapshot.snp.name}</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {snapshot.snp.value.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {formatChange(snapshot.snp.change, snapshot.snp.changePct)}
          </p>
        </article>
      </div>
      {snapshot.marketStatus ? (
        <p className="mt-3 text-[11px] text-slate-500">
          Market: {snapshot.marketStatus}
          {snapshot.isFallback ? " · seed/fallback" : ""}
        </p>
      ) : null}
    </div>
  );
}
