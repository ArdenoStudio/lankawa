import { FreshnessBadge } from "@/components/FreshnessBadge";
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
    seed: string;
    bankSeed: string;
    asOf: string;
    source: string;
    honesty: string;
  };
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
          <p className="mt-1 text-sm text-slate-400">{labels.subtitle}</p>
        </div>
        <FreshnessBadge tier="stale" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
          <p className="text-xs text-slate-500">{labels.bestBuy}</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {snapshot.bestBuy.name}
          </p>
          <p className="text-sm text-slate-300">
            {snapshot.bestBuy.buyLkr.toFixed(2)} LKR
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
          <p className="text-xs text-slate-500">{labels.bestSell}</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {snapshot.bestSell.name}
          </p>
          <p className="text-sm text-slate-300">
            {snapshot.bestSell.sellLkr.toFixed(2)} LKR
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">{labels.bank}</th>
              <th className="px-4 py-3 font-medium">{labels.buy}</th>
              <th className="px-4 py-3 font-medium">{labels.sell}</th>
              <th className="px-4 py-3 font-medium">{labels.spread}</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.banks.map((bank) => (
              <tr key={bank.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">
                    {bank.name}
                    {bank.isSeed ? (
                      <span className="ml-2 text-xs font-normal text-amber-200/80">
                        {labels.bankSeed}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500">{bank.note}</p>
                </td>
                <td className="px-4 py-3 text-slate-200">
                  {bank.buyLkr.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-slate-200">
                  {bank.sellLkr.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {bank.spreadLkr.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="space-y-1 text-xs text-slate-500">
        {snapshot.isSeed ? <p>{labels.seed}</p> : null}
        <p>
          {labels.asOf.replace("{date}", snapshot.asOf)} ·{" "}
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
