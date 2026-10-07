"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import type { PropertySnapshot } from "@/lib/types";
import {
  formatPropertyPrice,
  getMaxPropertyMedian,
  getPropertySnapshot,
} from "@/lib/property";

function formatTrendPct(value: number): string {
  const direction = value > 0 ? "↑" : value < 0 ? "↓" : "→";
  const sign = value > 0 ? "+" : "";
  return `${direction} ${sign}${value.toFixed(1)}%`;
}

export function PropertyDistrictTable({
  locale,
  snapshot: snapshotProp,
}: {
  locale: string;
  snapshot?: PropertySnapshot;
}) {
  const t = useTranslations("property");
  const snapshot = snapshotProp ?? getPropertySnapshot();
  const maxMedian = getMaxPropertyMedian();
  const bySlug = new Map(snapshot.districts.map((row) => [row.slug, row]));
  // Districts with data first (median desc), then districts with no live data
  // yet — never fabricated placeholder figures.
  const covered = DISTRICTS.filter((district) => bySlug.has(district.slug)).sort(
    (a, b) =>
      (bySlug.get(b.slug)?.medianPerPerch ?? 0) -
      (bySlug.get(a.slug)?.medianPerPerch ?? 0),
  );
  const uncovered = DISTRICTS.filter((district) => !bySlug.has(district.slug));

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-white/5 text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">{t("district")}</th>
            <th className="px-4 py-3 font-medium text-right">
              {t("medianPerPerch")}
            </th>
            <th className="px-4 py-3 font-medium text-right">
              {t("priceBand")}
            </th>
            <th className="px-4 py-3 font-medium text-right">{t("trend")}</th>
            <th className="px-4 py-3 font-medium">{t("intensity")}</th>
          </tr>
        </thead>
        <tbody>
          {covered.map((district) => {
            const row = bySlug.get(district.slug)!;
            const label = getDistrictName(district, locale);
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
                  LKR {row.medianPerPerch.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-slate-300">
                  {formatPropertyPrice(row.lowBand)} –{" "}
                  {formatPropertyPrice(row.highBand)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-300">
                  {formatTrendPct(row.trendPct)}
                </td>
                <td className="px-4 py-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-teal-400"
                      style={{
                        width: `${(row.medianPerPerch / maxMedian) * 100}%`,
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
                  className="font-medium text-teal-200 hover:text-teal-100"
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
  );
}
