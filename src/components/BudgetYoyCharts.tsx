import { MonoLineChart } from "@/components/charts/MonoLineChart";
import type { BudgetYoyCompare } from "@/lib/budget-yoy";

export function BudgetYoyCharts({
  compare,
  sectorLabels,
  ministryLabels,
  labels,
}: {
  compare: BudgetYoyCompare;
  sectorLabels: Record<string, string>;
  ministryLabels: Record<string, string>;
  labels: {
    title: string;
    subtitle: string;
    seed: string;
    methodology: string;
    prior: string;
    current: string;
    delta: string;
    totalsTitle: string;
    sectorsTitle: string;
    ministriesTitle: string;
    currencyUnit: string;
  };
}) {
  const totalSeries = compare.totals.map((row, index) => ({
    id: row.id,
    label: row.id,
    values: [
      { date: compare.prior.id, value: row.prior },
      { date: compare.current.id, value: row.current },
    ],
    className: index % 2 === 0 ? "text-white" : "text-neutral-400",
    step: true as const,
  }));

  const sectorRows = [...compare.sectors].sort(
    (a, b) => b.current - a.current,
  );
  const ministryRows = [...compare.ministries]
    .sort((a, b) => b.current - a.current)
    .slice(0, 7);

  return (
    <section className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            {labels.seed}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-400">{labels.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold text-white">{labels.totalsTitle}</h3>
        <p className="mt-1 text-xs text-neutral-500">
          {compare.prior.label} → {compare.current.label}
        </p>
        <div className="mt-4">
          <MonoLineChart
            id="budget-yoy-totals"
            ariaLabel={labels.totalsTitle}
            series={totalSeries.filter((item) => item.id !== "deficit")}
            height={140}
            valueFormat={(value) => `${value.toFixed(0)}`}
            startLabel={compare.prior.label}
            endLabel={compare.current.label}
          />
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {compare.totals.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            >
              <p className="text-neutral-400">{row.label}</p>
              <p className="mt-1 tabular-nums text-white">
                {row.prior.toLocaleString()} → {row.current.toLocaleString()}{" "}
                {labels.currencyUnit}
              </p>
              {row.deltaPct != null ? (
                <p className="mt-0.5 text-xs text-neutral-500">
                  {labels.delta.replace(
                    "{pct}",
                    `${row.deltaPct >= 0 ? "+" : ""}${row.deltaPct.toFixed(1)}`,
                  )}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-semibold text-white">
            {labels.sectorsTitle}
          </h3>
          <ul className="mt-3 space-y-2">
            {sectorRows.map((row) => {
              const max = Math.max(...sectorRows.map((item) => item.current), 1);
              return (
                <li key={row.id}>
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-white">
                      {sectorLabels[row.id] ?? row.id}
                    </span>
                    <span className="tabular-nums text-neutral-400">
                      {row.deltaPct != null
                        ? `${row.deltaPct >= 0 ? "+" : ""}${row.deltaPct.toFixed(1)}%`
                        : "—"}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className="h-full bg-white/70"
                      style={{ width: `${(row.current / max) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-semibold text-white">
            {labels.ministriesTitle}
          </h3>
          <ul className="mt-3 space-y-2">
            {ministryRows.map((row) => {
              const max = Math.max(
                ...ministryRows.map((item) => item.current),
                1,
              );
              return (
                <li key={row.id}>
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-white">
                      {ministryLabels[row.id] ?? row.id}
                    </span>
                    <span className="tabular-nums text-neutral-400">
                      {row.current.toLocaleString()} {labels.currencyUnit}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className="h-full bg-white/50"
                      style={{ width: `${(row.current / max) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <p className="text-xs text-neutral-500">{labels.methodology}</p>
    </section>
  );
}
