"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DataSaverGate } from "@/components/DataSaverGate";
import { Link } from "@/i18n/navigation";
import {
  CSE_WATCHLIST_MAX,
  CSE_WATCHLIST_OPTIONS,
  readCseWatchlist,
  toggleCseWatchlistSymbol,
  writeCseWatchlist,
} from "@/lib/cse-watchlist";
import type { CseCompanyQuote } from "@/lib/integrations/cse";

function formatChange(changePct: number | null): string {
  if (changePct == null) {
    return "—";
  }
  const sign = changePct >= 0 ? "+" : "";
  return `${sign}${changePct.toFixed(2)}%`;
}

function WatchlistInner() {
  const t = useTranslations("cseWatchlist");
  const [symbols, setSymbols] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    return readCseWatchlist(window.localStorage);
  });
  const [quotes, setQuotes] = useState<CseCompanyQuote[]>([]);

  useEffect(() => {
    if (symbols.length === 0) {
      setQuotes([]);
      return;
    }

    let cancelled = false;
    const params = new URLSearchParams({ symbols: symbols.join(",") });

    fetch(`/api/v1/cse/quotes?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("quote fetch failed");
        }
        return (await response.json()) as { quotes?: CseCompanyQuote[] };
      })
      .then((payload) => {
        if (!cancelled) {
          setQuotes(Array.isArray(payload.quotes) ? payload.quotes : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuotes([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [symbols]);

  function toggle(symbol: string) {
    const next = toggleCseWatchlistSymbol(symbols, symbol);
    setSymbols(next);
    writeCseWatchlist(window.localStorage, next);
  }

  const quoteBySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));

  return (
    <section className="space-y-3 border border-white/15 px-4 py-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-400">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {t("subtitle", { max: CSE_WATCHLIST_MAX })}
          </p>
        </div>
        <Link
          href="/economy"
          className="text-sm text-white underline decoration-white/30 hover:decoration-white"
        >
          {t("viewMarket")}
        </Link>
      </div>

      {symbols.length > 0 ? (
        <ul className="space-y-2" aria-label={t("savedLabel")}>
          {symbols.map((symbol) => {
            const quote = quoteBySymbol.get(symbol);
            return (
              <li
                key={symbol}
                className="flex items-center justify-between gap-3 border border-white/10 px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => toggle(symbol)}
                  className="text-left"
                  title={t("remove")}
                >
                  <p className="text-sm font-medium text-white">{symbol}</p>
                  {quote ? (
                    <p className="text-xs text-neutral-500">{quote.name}</p>
                  ) : null}
                </button>
                <div className="text-right">
                  {quote ? (
                    <>
                      <p className="text-sm font-medium text-white">
                        {quote.price.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {formatChange(quote.changePct)}
                        {quote.isFallback ? ` · ${t("seedQuote")}` : null}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-neutral-600">{t("loadingQuote")}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">{t("empty")}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {CSE_WATCHLIST_OPTIONS.map((symbol) => {
          const selected = symbols.includes(symbol);
          const atCap = symbols.length >= CSE_WATCHLIST_MAX && !selected;
          return (
            <button
              key={symbol}
              type="button"
              disabled={atCap}
              onClick={() => toggle(symbol)}
              aria-pressed={selected}
              className={`border px-3 py-1 text-xs transition ${
                selected
                  ? "border-white bg-white text-black"
                  : "border-white/25 text-neutral-200 hover:border-white/50 disabled:opacity-40"
              }`}
            >
              {symbol}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-neutral-600">{t("privacy")}</p>
    </section>
  );
}

export function CseWatchlistChip() {
  return (
    <DataSaverGate hideUntilHydrated>
      <WatchlistInner />
    </DataSaverGate>
  );
}
