import { Link } from "@/i18n/navigation";
import type { RemittanceTtSnapshot } from "@/lib/remittance";
import { getSourceProvenancePath } from "@/lib/sources";

export function RemittanceBoard({
  snapshot,
  labels,
}: {
  snapshot: RemittanceTtSnapshot;
  labels: {
    title: string;
    subtitle: string;
    bank: string;
    buy: string;
    sell: string;
    spread: string;
    bestBuy: string;
    bestSell: string;
    best: string;
    seed: string;
    live: string;
    mixed: string;
    bankSeed: string;
    bankLive: string;
    coverage: string;
    asOf: string;
    source: string;
    honesty: string;
    metricsLabel: string;
    tableLabel: string;
  };
}) {
  const liveCount = snapshot.liveCount;
  const seedCount = snapshot.seedCount;
  const boardStatus = snapshot.isSeed
    ? "seed"
    : seedCount > 0
      ? "mixed"
      : "live";
  const statusLabel =
    boardStatus === "seed"
      ? labels.bankSeed
      : boardStatus === "mixed"
        ? labels.mixed
        : labels.live;
  const asOfLabel = labels.asOf.replace("{date}", snapshot.asOf);
  const coverage = labels.coverage
    .replace("{live}", String(liveCount))
    .replace("{seed}", String(seedCount));

  return (
    <section
      className="lk-motion-fade-up space-y-4"
      aria-labelledby="remittance-board-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="remittance-board-heading"
            className="lk-motion-underline text-xl font-semibold text-white"
          >
            {labels.title}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{labels.subtitle}</p>
          <p className="mt-1 text-xs text-slate-500">{coverage}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 text-right">
          <p className="text-xs text-slate-400">{asOfLabel}</p>
          <p
            className={
              boardStatus === "live"
                ? "text-xs text-slate-300"
                : "text-xs text-amber-200/80"
            }
          >
            {statusLabel}
          </p>
        </div>
      </div>

      <div
        className="grid gap-3 sm:grid-cols-2"
        role="group"
        aria-label={labels.metricsLabel}
      >
        <div
          className="lk-motion-slide-in rounded-xl border border-white/25 bg-black/20 p-3 ring-1 ring-inset ring-white/10"
          style={{ animationDelay: "80ms" }}
        >
          <p className="text-xs text-slate-500">{labels.bestBuy}</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {snapshot.bestBuy.name}
            <span
              className={
                snapshot.bestBuy.isSeed
                  ? "ml-2 text-xs font-normal text-amber-200/80"
                  : "ml-2 text-xs font-normal text-slate-400"
              }
            >
              {snapshot.bestBuy.isSeed ? labels.bankSeed : labels.bankLive}
            </span>
          </p>
          <p className="text-sm text-slate-300">
            {snapshot.bestBuy.buyLkr.toFixed(2)} LKR
          </p>
        </div>
        <div
          className="lk-motion-slide-in rounded-xl border border-white/25 bg-black/20 p-3 ring-1 ring-inset ring-white/10"
          style={{ animationDelay: "140ms" }}
        >
          <p className="text-xs text-slate-500">{labels.bestSell}</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {snapshot.bestSell.name}
            <span
              className={
                snapshot.bestSell.isSeed
                  ? "ml-2 text-xs font-normal text-amber-200/80"
                  : "ml-2 text-xs font-normal text-slate-400"
              }
            >
              {snapshot.bestSell.isSeed ? labels.bankSeed : labels.bankLive}
            </span>
          </p>
          <p className="text-sm text-slate-300">
            {snapshot.bestSell.sellLkr.toFixed(2)} LKR
          </p>
        </div>
      </div>

      <div className="lk-motion-slide-in overflow-x-auto rounded-2xl border border-white/10 bg-white/5" style={{ animationDelay: "200ms" }}>
        <table className="min-w-full text-left text-sm" aria-label={labels.tableLabel}>
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">{labels.bank}</th>
              <th className="px-4 py-3 font-medium">{labels.buy}</th>
              <th className="px-4 py-3 font-medium">{labels.sell}</th>
              <th className="px-4 py-3 font-medium">{labels.spread}</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.banks.map((bank) => {
              const isBestBuy = bank.id === snapshot.bestBuy.id;
              const isBestSell = bank.id === snapshot.bestSell.id;

              return (
                <tr
                  key={bank.id}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">
                      {bank.name}
                      <span
                        className={
                          bank.isSeed
                            ? "ml-2 text-xs font-normal text-amber-200/80"
                            : "ml-2 text-xs font-normal text-slate-400"
                        }
                      >
                        {bank.isSeed ? labels.bankSeed : labels.bankLive}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">{bank.note}</p>
                  </td>
                  <td
                    className={
                      isBestBuy
                        ? "bg-white/[0.06] px-4 py-3 font-semibold text-white"
                        : "px-4 py-3 text-slate-200"
                    }
                  >
                    {bank.buyLkr.toFixed(2)}
                    {isBestBuy ? (
                      <span className="ml-1.5 text-xs font-normal text-slate-400">
                        {labels.best}
                      </span>
                    ) : null}
                  </td>
                  <td
                    className={
                      isBestSell
                        ? "bg-white/[0.06] px-4 py-3 font-semibold text-white"
                        : "px-4 py-3 text-slate-200"
                    }
                  >
                    {bank.sellLkr.toFixed(2)}
                    {isBestSell ? (
                      <span className="ml-1.5 text-xs font-normal text-slate-400">
                        {labels.best}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {bank.spreadLkr.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="space-y-1 text-xs text-slate-500">
        {boardStatus === "seed" ? <p>{labels.seed}</p> : null}
        {boardStatus === "mixed" ? (
          <p>
            {labels.mixed} · {coverage}
          </p>
        ) : null}
        <p>
          {asOfLabel} ·{" "}
          <Link
            href={getSourceProvenancePath(snapshot.sourceId)}
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {labels.source}
          </Link>
        </p>
        <p>{labels.honesty}</p>
      </footer>
    </section>
  );
}
