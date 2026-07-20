"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getDistrictName, getDistrict } from "@/lib/districts";
import { formatFoodPrice, getFoodSnapshot } from "@/lib/food";
import type { FoodSnapshot } from "@/lib/types";

export function FoodDistrictTable({
  locale,
  snapshot: snapshotProp,
  mixedSeedDistricts = false,
}: {
  locale: string;
  snapshot?: FoodSnapshot;
  mixedSeedDistricts?: boolean;
}) {
  const t = useTranslations("food");
  const snapshot = snapshotProp ?? getFoodSnapshot();
  const sorted = [...snapshot.districts].sort(
    (a, b) => b.monthlyBasketLkr - a.monthlyBasketLkr,
  );
  const maxBasket = sorted[0]?.monthlyBasketLkr ?? 1;

  return (
    <div className="space-y-3">
      {mixedSeedDistricts ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          {t("mixedSeedDistricts")}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">{t("district")}</th>
              <th className="px-4 py-3 font-medium text-right">{t("dailyMeal")}</th>
              <th className="px-4 py-3 font-medium text-right">{t("monthlyBasket")}</th>
              <th className="px-4 py-3 font-medium text-right">{t("restaurantIndex")}</th>
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
                      className="font-medium text-white underline decoration-white/30 hover:decoration-white"
                    >
                      {label}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    LKR {formatFoodPrice(row.dailyMealCostLkr)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    LKR {formatFoodPrice(row.monthlyBasketLkr)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {row.restaurantIndex}
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-white/70"
                        style={{
                          width: `${(row.monthlyBasketLkr / maxBasket) * 100}%`,
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
    </div>
  );
}
