"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getDistrict, getDistrictName } from "@/lib/districts";
import { getAqiBandColor, getAqiBandLabelKey } from "@/lib/environment";
import type { EnvironmentDistrictStat } from "@/lib/types";

export function EnvironmentDistrictTable({
  locale,
  districts,
}: {
  locale: string;
  districts: EnvironmentDistrictStat[];
}) {
  const t = useTranslations("environment");
  const rankedDistricts = [...districts].sort((a, b) => b.aqi - a.aqi);

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-white/5">
          <tr>
            <th className="px-4 py-3 font-medium text-slate-400">{t("district")}</th>
            <th className="px-4 py-3 font-medium text-slate-400">{t("aqi")}</th>
            <th className="px-4 py-3 font-medium text-slate-400">{t("pm25")}</th>
            <th className="px-4 py-3 font-medium text-slate-400">{t("band")}</th>
          </tr>
        </thead>
        <tbody>
          {rankedDistricts.map((row) => {
            const district = getDistrict(row.slug);
            if (!district) {
              return null;
            }
            return (
              <tr key={row.slug} className="border-b border-white/5">
                <td className="px-4 py-3">
                  <Link
                    href={`/districts/${row.slug}`}
                    className="font-medium text-white hover:text-teal-200"
                  >
                    {getDistrictName(district, locale)}
                  </Link>
                </td>
                <td className="px-4 py-3 font-semibold text-white">{row.aqi}</td>
                <td className="px-4 py-3 text-slate-300">{row.pm25} µg/m³</td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${getAqiBandColor(row.band)}22`,
                      color: getAqiBandColor(row.band),
                    }}
                  >
                    {t(getAqiBandLabelKey(row.band))}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
