import { Link } from "@/i18n/navigation";
import {
  bankDisplayName,
  getCompareMatrix,
  type BankDepositBankId,
  type BankDepositRatesSnapshot,
  type DepositCompareRow,
} from "@/lib/integrations/bank-deposit-rates";
import { getSourceProvenancePath } from "@/lib/sources";

const BANK_ORDER: BankDepositBankId[] = [
  "combank",
  "sampath",
  "seylan",
  "hnb",
];

function formatRate(ratePa: number | null): string {
  if (ratePa == null) {
    return "—";
  }
  return ratePa.toFixed(2);
}

function shortBankLabel(bankId: BankDepositBankId): string {
  switch (bankId) {
    case "combank":
      return "ComBank";
    case "sampath":
      return "Sampath";
    case "seylan":
      return "Seylan";
    case "hnb":
      return "HNB";
    default:
      return bankId;
  }
}

export function BankDepositRatesBoard({
  snapshot,
  labels,
}: {
  snapshot: BankDepositRatesSnapshot;
  labels: {
    title: string;
    subtitle: string;
    tenor: string;
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
    tableLabel: string;
    months: string;
    paidIn: string;
  };
}) {
  const matrix: DepositCompareRow[] = getCompareMatrix(snapshot);
  const liveCount = snapshot.liveCount;
  const seedCount = snapshot.seedCount;
  const boardStatus = snapshot.isSeed
    ? "seed"
    : seedCount > 0
      ? "mixed"
      : "live";
  const statusLabel =
    boardStatus === "seed"
      ? labels.seed
      : boardStatus === "mixed"
        ? labels.mixed
        : labels.live;
  const asOfLabel = labels.asOf.replace("{date}", snapshot.asOf);
  const coverage = labels.coverage
    .replace("{live}", String(liveCount))
    .replace("{seed}", String(seedCount));

  const seedByBank = new Map(
    snapshot.banks.map((b) => [b.id, b.isSeed] as const),
  );

  return (
    <section
      className="lk-motion-fade-up space-y-3"
      aria-labelledby="deposit-rates-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="deposit-rates-heading"
            className="lk-motion-underline text-xl font-semibold text-white"
          >
            {labels.title}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{labels.subtitle}</p>
          <p className="mt-1 text-xs text-slate-500">
            {labels.paidIn} · {coverage}
          </p>
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
        className="lk-motion-slide-in overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03]"
        style={{ animationDelay: "80ms" }}
      >
        <table
          className="min-w-full border-collapse text-left text-xs tabular-nums"
          aria-label={labels.tableLabel}
        >
          <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="whitespace-nowrap px-3 py-2 font-medium">
                {labels.tenor}
              </th>
              {BANK_ORDER.map((bankId) => {
                const isSeed = seedByBank.get(bankId) ?? true;
                return (
                  <th
                    key={bankId}
                    className="whitespace-nowrap px-3 py-2 font-medium"
                    title={bankDisplayName(bankId)}
                  >
                    <span className="text-slate-300">
                      {shortBankLabel(bankId)}
                    </span>
                    <span
                      className={
                        isSeed
                          ? "ml-1.5 font-normal normal-case tracking-normal text-amber-200/70"
                          : "ml-1.5 font-normal normal-case tracking-normal text-slate-500"
                      }
                    >
                      {isSeed ? labels.bankSeed : labels.bankLive}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, idx) => (
              <tr
                key={row.tenorMonths}
                className="border-b border-white/5 last:border-0"
              >
                <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-300">
                  {labels.months.replace("{n}", String(row.tenorMonths))}
                </td>
                {BANK_ORDER.map((bankId) => {
                  const rate = row.rates[bankId];
                  const isBest =
                    rate != null && row.bestBankId === bankId;
                  return (
                    <td
                      key={bankId}
                      className={
                        isBest
                          ? "bg-white/[0.07] px-3 py-2 font-semibold text-white"
                          : "px-3 py-2 text-slate-200"
                      }
                      style={
                        idx === 0
                          ? { animationDelay: `${120 + BANK_ORDER.indexOf(bankId) * 30}ms` }
                          : undefined
                      }
                    >
                      {formatRate(rate)}
                      {isBest ? (
                        <span className="ml-1 text-[10px] font-normal text-slate-400">
                          {labels.best}
                        </span>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
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
