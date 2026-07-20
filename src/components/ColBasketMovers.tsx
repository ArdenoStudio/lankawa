import type { ColBasketMover } from "@/lib/col-movers";

function formatDelta(value: number, fractionDigits: number): string {
  const direction = value > 0 ? "↑" : value < 0 ? "↓" : "→";
  const sign = value > 0 ? "+" : "";
  return `${direction} ${sign}${value.toFixed(fractionDigits)}`;
}

export function ColBasketMovers({
  movers,
  labels,
}: {
  movers: ColBasketMover[];
  labels: {
    title: string;
    subtitle: string;
    empty: string;
    fuel: string;
    food: string;
    honestyLive: string;
    honestySeed: string;
  };
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
        <p className="mt-1 text-sm text-slate-400">{labels.subtitle}</p>
      </div>

      {movers.length === 0 ? (
        <p className="text-sm text-slate-500">{labels.empty}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {movers.map((mover) => (
            <li
              key={mover.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-white">{mover.label}</p>
                <span className="text-[10px] uppercase tracking-wide text-slate-500">
                  {mover.category === "fuel" ? labels.fuel : labels.food}
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">
                {mover.currentLkr.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
                <span className="ml-1 text-xs font-normal text-slate-400">
                  {mover.unit}
                </span>
              </p>
              <p className="mt-1 text-sm font-medium text-slate-300">
                {formatDelta(mover.deltaLkr, mover.category === "fuel" ? 0 : 0)}{" "}
                ({formatDelta(mover.deltaPct, 1)}%)
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {mover.asOf} ·{" "}
                {mover.honesty === "live"
                  ? labels.honestyLive
                  : labels.honestySeed}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
