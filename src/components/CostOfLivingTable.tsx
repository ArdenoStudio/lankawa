"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getDistrict, getDistrictName } from "@/lib/districts";
import {
  formatColIndex,
  getColIndexColor,
} from "@/lib/cost-of-living";
import type { CostOfLivingSnapshot } from "@/lib/types";

export function CostOfLivingTable({
  locale,
  snapshot,
}: {
  locale: string;
  snapshot: CostOfLivingSnapshot;
}) {
  const t = useTranslations("costOfLiving");
  const districts = [...snapshot.districts].sort((a, b) => a.rank - b.rank);

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
                    className="text-teal-300 hover:text-teal-200"
                  >
                    {getDistrictName(district, locale)}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium text-white">
                  <span
                    style={{
                      color: getColIndexColor(row.index, snapshot.nationalIndex),
                    }}
                  >
                    {formatColIndex(row.index)}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">
                    {t("vsNational", { base: snapshot.nationalIndex })}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  LKR {row.foodBasketLkr.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-slate-300">{row.propertyComponent}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/compare?districts=colombo,${row.slug}`}
                    className="text-teal-300 hover:text-teal-200"
                  >
                    {t("compare")}
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
