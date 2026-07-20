import { DataSaverGate } from "@/components/DataSaverGate";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import type { CseMover, CseSnapshot } from "@/lib/integrations/cse";
import { getSourceProvenancePath } from "@/lib/sources";

function formatCompact(value: number | null): string {
  if (value == null) {
    return "—";
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatChange(change: number | null, changePct: number | null): string {
  if (change == null && changePct == null) {
    return "—";
  }

  const directionValue = changePct ?? change ?? 0;
  const direction =
    directionValue > 0 ? "↑" : directionValue < 0 ? "↓" : "→";
  const parts: string[] = [];
  if (change != null) {
    parts.push(`${change >= 0 ? "+" : ""}${change.toFixed(2)}`);
  }
  if (changePct != null) {
    parts.push(`(${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%)`);
  }
  return `${direction} ${parts.join(" ")}`;
}

function formatSectorValuation(sector: {
  per: number | null;
  pbv: number | null;
  dy: number | null;
  companiesTraded: number | null;
  companiesListed: number | null;
}): string | null {
  const parts: string[] = [];
  if (sector.per != null) {
    parts.push(`PER ${sector.per.toFixed(1)}`);
  }
  if (sector.pbv != null) {
    parts.push(`PBV ${sector.pbv.toFixed(1)}`);
  }
  if (sector.dy != null) {
    parts.push(`DY ${sector.dy.toFixed(1)}%`);
  }
  if (sector.companiesTraded != null && sector.companiesListed != null) {
    parts.push(`${sector.companiesTraded}/${sector.companiesListed}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

function MoverList({
  title,
  movers,
  emptyLabel,
}: {
  title: string;
  movers: CseMover[];
  emptyLabel: string;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-300">{title}</h3>
      {movers.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {movers.map((mover) => {
            return (
              <li
                key={mover.symbol}
                className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-black/10 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-white">{mover.symbol}</p>
                  <p className="text-xs text-slate-500">{mover.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {mover.price.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p
                    className="text-xs font-medium text-slate-300"
                  >
                    {formatChange(mover.change, mover.changePct)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function CseMarketCard({
  snapshot,
  labels,
}: {
  snapshot: CseSnapshot;
  labels: {
    title: string;
    subtitle: string;
    sourceName: string;
    aspi: string;
    snp: string;
    gainers: string;
    losers: string;
    marketStatus: string;
    trades: string;
    shareVolume: string;
    turnover: string;
    fallbackNote: string;
    noMovers: string;
    sectors: string;
    mostActive: string;
    foreign: string;
    domesticTrades: string;
    foreignTrades: string;
    foreignBuy: string;
    foreignSell: string;
    noSectors: string;
    sectorsSkipped: string;
    noActive: string;
    highLow: string;
  };
}) {
  const indices = [
    { key: "aspi", label: labels.aspi, index: snapshot.aspi },
    { key: "snp", label: labels.snp, index: snapshot.snp },
  ] as const;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {labels.subtitle} ·{" "}
            <Link
              href={getSourceProvenancePath(snapshot.sourceId)}
              className="text-white underline decoration-white/30 hover:decoration-white"
            >
              {labels.sourceName}
            </Link>
          </p>
          {snapshot.marketStatus ? (
            <p className="mt-1 text-sm text-slate-500">
              {labels.marketStatus}: {snapshot.marketStatus}
            </p>
          ) : null}
        </div>
        <FreshnessBadge tier={snapshot.tier} />
      </div>

      {snapshot.isFallback ? (
        <p className="text-sm text-neutral-300">{labels.fallbackNote}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {indices.map(({ key, label, index }) => {
          return (
            <article
              key={key}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {index.value.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </p>
              <p
                className="mt-1 text-sm font-medium text-slate-300"
              >
                {formatChange(index.change, index.changePct)}
              </p>
              {index.high != null || index.low != null ? (
                <p className="mt-2 text-xs text-slate-500">
                  {labels.highLow}:{" "}
                  {index.high?.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  }) ?? "—"}{" "}
                  /{" "}
                  {index.low?.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  }) ?? "—"}
                </p>
              ) : null}
            </article>
          );
        })}

        {snapshot.summary ? (
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-500">{labels.trades}</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {snapshot.summary.tradeCount?.toLocaleString() ?? "—"}
            </p>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <p>
                {labels.shareVolume}:{" "}
                {snapshot.summary.shareVolume?.toLocaleString() ?? "—"}
              </p>
              <p>
                {labels.turnover}:{" "}
                {snapshot.summary.turnover?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) ?? "—"}{" "}
                LKR
              </p>
            </div>
          </article>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MoverList
          title={labels.gainers}
          movers={snapshot.topGainers}
          emptyLabel={labels.noMovers}
        />
        <MoverList
          title={labels.losers}
          movers={snapshot.topLosers}
          emptyLabel={labels.noMovers}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <DataSaverGate
          fallback={
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-neutral-300">
                {labels.sectors}
              </h3>
              <p className="text-sm text-neutral-500">{labels.sectorsSkipped}</p>
            </div>
          }
        >
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-neutral-300">
              {labels.sectors}
            </h3>
            {snapshot.sectors.length === 0 ? (
              <p className="text-sm text-neutral-500">{labels.noSectors}</p>
            ) : (
              <ul className="space-y-2">
                {snapshot.sectors.slice(0, 6).map((sector) => {
                  const valuation = formatSectorValuation(sector);
                  return (
                    <li
                      key={sector.symbol}
                      className="flex items-start justify-between gap-3 border border-white/10 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {sector.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {sector.symbol}
                        </p>
                        {valuation ? (
                          <p className="mt-0.5 text-[11px] text-neutral-500">
                            {valuation}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {sector.indexValue.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-neutral-300">
                          {formatChange(sector.change, sector.changePct)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </DataSaverGate>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-300">
            {labels.mostActive}
          </h3>
          {snapshot.mostActive.length === 0 ? (
            <p className="text-sm text-neutral-500">{labels.noActive}</p>
          ) : (
            <ul className="space-y-2">
              {snapshot.mostActive.slice(0, 6).map((row) => (
                <li
                  key={row.symbol}
                  className="flex items-start justify-between gap-3 border border-white/10 px-3 py-2"
                >
                  <p className="text-sm font-medium text-white">{row.symbol}</p>
                  <div className="text-right text-xs text-neutral-400">
                    <p>{formatCompact(row.shareVolume)} sh</p>
                    <p>{formatCompact(row.turnover)} LKR</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-medium text-slate-300">{labels.foreign}</h3>
          {snapshot.foreignDomestic ? (
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">{labels.domesticTrades}</dt>
                <dd className="text-white">
                  {formatCompact(snapshot.foreignDomestic.domesticTrades)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">{labels.foreignTrades}</dt>
                <dd className="text-white">
                  {formatCompact(snapshot.foreignDomestic.foreignTrades)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">{labels.foreignBuy}</dt>
                <dd className="text-white">
                  {formatCompact(snapshot.foreignDomestic.foreignPurchase)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">{labels.foreignSell}</dt>
                <dd className="text-white">
                  {formatCompact(snapshot.foreignDomestic.foreignSales)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-slate-500">{labels.noActive}</p>
          )}
        </article>
      </div>
    </section>
  );
}
