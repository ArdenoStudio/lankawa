"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getDistrictName, getDistrict } from "@/lib/districts";
import { getDengueRiskColor, getMaxDengueCases } from "@/lib/health";
import type { DengueDistrictStat } from "@/lib/types";

export function DengueDistrictTable({
  districts,
  locale,
}: {
  districts: DengueDistrictStat[];
  locale: string;
}) {
  const t = useTranslations("health");
  const maxCases = getMaxDengueCases();
  const sorted = [...districts].sort((a, b) => b.cases - a.cases);

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-white/5 text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">{t("district")}</th>
            <th className="px-4 py-3 font-medium text-right">{t("cases")}</th>
            <th className="px-4 py-3 font-medium text-right">{t("change")}</th>
            <th className="px-4 py-3 font-medium">{t("risk")}</th>
            <th className="px-4 py-3 font-medium">{t("intensity")}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const district = getDistrict(row.slug);
            const label = district ? getDistrictName(district, locale) : row.slug;
            return (
              <tr key={row.slug} className="border-b border-white/5">
                <td className="px-4 py-3">
                  <Link
                    href={`/districts/${row.slug}`}
                    className="font-medium text-teal-200 hover:text-teal-100"
                  >
                    {label}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right text-white">
                  {row.cases.toLocaleString()}
                </td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    row.changePct >= 0 ? "text-rose-300" : "text-teal-300"
                  }`}
                >
                  {row.changePct >= 0 ? "+" : ""}
                  {row.changePct.toFixed(1)}%
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${getDengueRiskColor(row.riskLevel)}22`,
                      color: getDengueRiskColor(row.riskLevel),
                    }}
                  >
                    {t(`risk_${row.riskLevel}`)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(row.cases / maxCases) * 100}%`,
                        backgroundColor: getDengueRiskColor(row.riskLevel),
                      }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
