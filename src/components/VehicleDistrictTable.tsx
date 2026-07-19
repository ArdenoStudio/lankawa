"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getDistrictName, getDistrict } from "@/lib/districts";
import {
  formatVehiclePrice,
  getVehicleSnapshot,
} from "@/lib/vehicle";
import type { VehicleSnapshot } from "@/lib/types";

export function VehicleDistrictTable({
  locale,
  snapshot: snapshotProp,
}: {
  locale: string;
  snapshot?: VehicleSnapshot;
}) {
  const t = useTranslations("vehicles");
  const snapshot = snapshotProp ?? getVehicleSnapshot();
  const sorted = [...snapshot.districts].sort(
    (a, b) => b.medianPriceLkr - a.medianPriceLkr,
  );
  const maxMedian = sorted[0]?.medianPriceLkr ?? 1;

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-white/5 text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">{t("district")}</th>
            <th className="px-4 py-3 font-medium text-right">{t("listings")}</th>
            <th className="px-4 py-3 font-medium text-right">{t("medianPrice")}</th>
            <th className="px-4 py-3 font-medium">{t("popularModel")}</th>
            <th className="px-4 py-3 font-medium">{t("intensity")}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const district = getDistrict(row.slug);
            const label = district ? getDistrictName(district, locale) : row.districtName;
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
                <td className="px-4 py-3 text-right text-slate-300">
                  {row.listingCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-white">
                  LKR {formatVehiclePrice(row.medianPriceLkr)}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {row.topMake} {row.topModel}
                </td>
                <td className="px-4 py-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-teal-400"
                      style={{
                        width: `${(row.medianPriceLkr / maxMedian) * 100}%`,
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
