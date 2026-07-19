"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { BudgetFiscalYear } from "@/lib/types";

export function BudgetBreakdown({
  fiscalYear,
  sectorLabels,
  ministryLabels,
}: {
  fiscalYear: BudgetFiscalYear;
  sectorLabels: Record<string, string>;
  ministryLabels: Record<string, string>;
}) {
  const t = useTranslations("budget");
  const maxSector = Math.max(...fiscalYear.sectors.map((sector) => sector.amount));

  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("revenue")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-teal-300">
            {fiscalYear.revenue.toLocaleString()} {t("currencyUnit")}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("expenditure")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {fiscalYear.expenditure.toLocaleString()} {t("currencyUnit")}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("deficit")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-rose-300">
            {fiscalYear.deficit.toLocaleString()} {t("currencyUnit")}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("capitalExpenditure")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {fiscalYear.capitalExpenditure.toLocaleString()} {t("currencyUnit")}
          </dd>
        </div>
      </dl>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("sectorBreakdown")}</h2>
        <ul className="space-y-3">
          {fiscalYear.sectors.map((sector) => (
            <li key={sector.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-white">
                  {sectorLabels[sector.id] ?? sector.id}
                </span>
                <span className="text-sm text-slate-400">
                  {sector.amount.toLocaleString()} {t("currencyUnit")} ·{" "}
                  {sector.sharePct.toFixed(1)}%
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-teal-500/70"
                  style={{ width: `${(sector.amount / maxSector) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("ministryBreakdown")}</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">{t("ministry")}</th>
                <th className="px-4 py-3 font-medium">{t("sector")}</th>
                <th className="px-4 py-3 font-medium text-right">{t("allocation")}</th>
              </tr>
            </thead>
            <tbody>
              {fiscalYear.ministries.map((ministry) => (
                <tr key={ministry.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white">
                    {ministryLabels[ministry.id] ?? ministry.id}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {sectorLabels[ministry.sector] ?? ministry.sector}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-200">
                    {ministry.amount.toLocaleString()} {t("currencyUnit")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-sm text-slate-500">
        {t("disclaimer")}{" "}
        <Link href="/sources/budget_verite_seed" className="text-teal-300 hover:text-teal-200">
          {t("sourceLink")}
        </Link>
      </p>
    </div>
  );
}
