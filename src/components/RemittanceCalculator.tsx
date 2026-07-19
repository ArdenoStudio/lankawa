"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { FxRateBand } from "@/lib/types";

function parseAmount(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function RemittanceCalculator({ rates }: { rates: FxRateBand }) {
  const locale = useLocale();
  const t = useTranslations("economy.remittance");
  const [usdAmount, setUsdAmount] = useState("100");
  const [lkrAmount, setLkrAmount] = useState("30000");
  const lkrFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 2,
      }),
    [locale],
  );
  const usdFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const usdToLkr = useMemo(() => {
    const amount = parseAmount(usdAmount);
    return amount == null ? null : amount * rates.sellRate;
  }, [rates.sellRate, usdAmount]);

  const lkrToUsd = useMemo(() => {
    const amount = parseAmount(lkrAmount);
    return amount == null ? null : amount / rates.buyRate;
  }, [rates.buyRate, lkrAmount]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{t("title")}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            {t("subtitle")}
          </p>
        </div>
        <p className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
          {t("asOf", { date: rates.date })}
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/15 p-4">
          <label className="text-sm font-medium text-slate-300">
            {t("usdToLkrLabel")}
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-base text-white outline-none transition focus:border-white/40"
              inputMode="decimal"
              min="0"
              type="number"
              value={usdAmount}
              onChange={(event) => setUsdAmount(event.target.value)}
              aria-label={t("usdAmount")}
            />
          </label>
          <p className="mt-4 text-sm text-slate-500">{t("sellRate")}</p>
          <p className="text-lg font-semibold text-white">
            {rates.sellRate.toFixed(2)} LKR
          </p>
          <p className="mt-4 text-sm text-slate-500">{t("lkrEstimate")}</p>
          <p className="text-2xl font-semibold text-white">
            {usdToLkr == null ? "—" : lkrFormatter.format(usdToLkr)} LKR
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/15 p-4">
          <label className="text-sm font-medium text-slate-300">
            {t("lkrToUsdLabel")}
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-base text-white outline-none transition focus:border-white/40"
              inputMode="decimal"
              min="0"
              type="number"
              value={lkrAmount}
              onChange={(event) => setLkrAmount(event.target.value)}
              aria-label={t("lkrAmount")}
            />
          </label>
          <p className="mt-4 text-sm text-slate-500">{t("buyRate")}</p>
          <p className="text-lg font-semibold text-white">
            {rates.buyRate.toFixed(2)} LKR
          </p>
          <p className="mt-4 text-sm text-slate-500">{t("usdEstimate")}</p>
          <p className="text-2xl font-semibold text-white">
            {lkrToUsd == null ? "—" : usdFormatter.format(lkrToUsd)} USD
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {t("disclaimer")}
      </p>
    </section>
  );
}
