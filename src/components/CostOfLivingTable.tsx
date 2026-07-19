"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getDistrict, getDistrictName } from "@/lib/districts";
import {
  formatColIndex,
  getColIndexColor,
  getCostOfLivingSnapshot,
  getRankedCostOfLivingDistricts,
} from "@/lib/cost-of-living";

export function CostOfLivingTable({ locale }: { locale: string }) {
  const t = useTranslations("costOfLiving");
  const snapshot = getCostOfLivingSnapshot();
  const districts = getRankedCostOfLivingDistricts();

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-white/5">
          <tr>
            <th className="px-4 py-3 font-medium text-slate-400">{t("rank")}</th>
            <th className="px-4 py-3 font-medium text-slate-400">{t("district")}</th>
            <th className="px-4 py-3 font-medium text-slate-400">{t("index")}</th>
            <th className="px-4 py-3 font-medium text-slate-400">{t("foodBasket")}</th>
            <th className="px-4 py-3 font-medium text-slate-400">{t("property")}</th>
            <th className="px-4 py-3 font-medium text-slate-400">{t("compare")}</th>
          </tr>
        </thead>
        <tbody>
          {districts.map((row) => {
            const district = getDistrict(row.slug);
            if (!district) {
              return null;
            }
            return (
              <tr key={row.slug} className="border-b border-white/5">
                <td className="px-4 py-3 text-slate-400">#{row.rank}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/districts/${row.slug}`}
                    className="font-medium text-white hover:text-teal-200"
                  >
                    {getDistrictName(district, locale)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-2 font-semibold text-white"
                    style={{ color: getColIndexColor(row.index, snapshot.nationalIndex) }}
                  >
                    {formatColIndex(row.index)}
                    <span className="text-xs font-normal text-slate-500">
                      ({t("vsNational", { base: snapshot.nationalIndex })})
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  LKR {row.foodBasketLkr.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-slate-300">{row.propertyComponent}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/compare?districts=${row.slug},colombo`}
                    className="text-teal-300 hover:text-teal-200"
                  >
                    {t("compareLink")}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
