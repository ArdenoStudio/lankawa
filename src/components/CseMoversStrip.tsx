import { Link } from "@/i18n/navigation";
import type { CseMover } from "@/lib/integrations/cse";
import { getSourceProvenancePath } from "@/lib/sources";

function formatPct(changePct: number | null): string {
  if (changePct == null) {
    return "—";
  }
  return `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`;
}

function formatPrice(price: number): string {
  return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function MoverColumn({
  title,
  movers,
  emptyLabel,
}: {
  title: string;
  movers: CseMover[];
  emptyLabel: string;
}) {
  const rows = movers.slice(0, 5);

  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <h3 className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="border border-white/10 px-2.5 py-1.5 text-xs text-neutral-500">
          {emptyLabel}
        </p>
      ) : (
        <ul
          className="divide-y divide-white/10 border border-white/10 text-xs"
          aria-label={title}
        >
          {rows.map((mover, index) => (
            <li
              key={mover.symbol}
              className="lk-motion-slide-in flex items-baseline justify-between gap-3 px-2.5 py-1.5"
              style={{ animationDelay: `${40 + index * 35}ms` }}
            >
              <span className="truncate font-medium tracking-tight text-white">
                {mover.symbol}
              </span>
              <span className="shrink-0 tabular-nums text-neutral-300">
                {formatPrice(mover.price)}
                <span className="ml-2 text-neutral-400">
                  {formatPct(mover.changePct)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CseMoversStrip({
  topGainers,
  topLosers,
  isFallback,
  sourceId,
  labels,
}: {
  topGainers: CseMover[];
  topLosers: CseMover[];
  isFallback: boolean;
  sourceId: string;
  labels: {
    title: string;
    subtitle: string;
    gainers: string;
    losers: string;
    empty: string;
    seed: string;
    honesty: string;
    sourceName: string;
  };
}) {
  return (
    <section
      className="lk-motion-fade-up space-y-3 border border-white/15 bg-black px-3 py-3 sm:px-4"
      aria-labelledby="cse-movers-strip-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <h2
            id="cse-movers-strip-heading"
            className="lk-motion-underline text-sm font-semibold tracking-tight text-white"
          >
            {labels.title}
          </h2>
          <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">
            {labels.subtitle}
          </p>
        </div>
        {isFallback ? (
          <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
            {labels.seed}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <MoverColumn
          title={labels.gainers}
          movers={topGainers}
          emptyLabel={labels.empty}
        />
        <MoverColumn
          title={labels.losers}
          movers={topLosers}
          emptyLabel={labels.empty}
        />
      </div>

      <p className="text-[11px] text-neutral-500">{labels.honesty}</p>
      <p className="text-[11px] text-neutral-500">
        <Link
          href={getSourceProvenancePath(sourceId)}
          className="text-white underline decoration-white/30 hover:decoration-white"
        >
          {labels.sourceName}
        </Link>
      </p>
    </section>
  );
}
