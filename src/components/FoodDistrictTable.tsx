"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
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
  const bySlug = new Map(snapshot.districts.map((row) => [row.slug, row]));
  // Districts with data first (basket desc), then districts with no live data
  // yet — never fabricated placeholder figures.
  const covered = DISTRICTS.filter((district) => bySlug.has(district.slug)).sort(
    (a, b) =>
      (bySlug.get(b.slug)?.monthlyBasketLkr ?? 0) -
      (bySlug.get(a.slug)?.monthlyBasketLkr ?? 0),
  );
  const uncovered = DISTRICTS.filter((district) => !bySlug.has(district.slug));
  const maxBasket = Math.max(
    ...covered.map((d) => bySlug.get(d.slug)?.monthlyBasketLkr ?? 0),
    1,
  );

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
            {covered.map((district) => {
              const row = bySlug.get(district.slug)!;
              return (
                <tr key={row.slug} className="border-b border-white/5">
                  <td className="px-4 py-3">
                    <Link
                      href={`/districts/${row.slug}`}
                      className="font-medium text-white underline decoration-white/30 hover:decoration-white"
                    >
                      {getDistrictName(district, locale)}
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
            {uncovered.map((district) => (
              <tr key={district.slug} className="border-b border-white/5">
                <td className="px-4 py-3">
                  <Link
                    href={`/districts/${district.slug}`}
                    className="font-medium text-white underline decoration-white/30 hover:decoration-white"
                  >
                    {getDistrictName(district, locale)}
                  </Link>
                </td>
                <td
                  colSpan={4}
                  className="px-4 py-3 text-right text-sm text-slate-500"
                >
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-white/25 text-neutral-400">
                    {t("noDataYet")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
