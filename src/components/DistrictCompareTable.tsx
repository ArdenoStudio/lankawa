"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { DistrictCompareRow } from "@/lib/compare";

export function DistrictCompareTable({ rows }: { rows: DistrictCompareRow[] }) {
  const t = useTranslations("compare");

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-400">
        {t("empty")}
      </p>
    );
  }

  const metrics: Array<{
    key: keyof DistrictCompareRow;
    label: string;
    format: (row: DistrictCompareRow) => string;
  }> = [
    {
      key: "population",
      label: t("population"),
      format: (row) => row.population.toLocaleString(),
    },
    {
      key: "density",
      label: t("density"),
      format: (row) => `${row.density.toLocaleString()} /km²`,
    },
    {
      key: "areaSqKm",
      label: t("area"),
      format: (row) => `${row.areaSqKm.toLocaleString()} km²`,
    },
    {
      key: "presidentialWinner",
      label: t("presidential2024"),
      format: (row) =>
        row.presidentialWinner
          ? `${row.presidentialWinner} (${row.presidentialShare?.toFixed(1)}%)`
          : "—",
    },
    {
      key: "parliamentaryWinner",
      label: t("parliamentary2024"),
      format: (row) =>
        row.parliamentaryWinner
          ? `${row.parliamentaryWinner} (${row.parliamentarySeats})`
          : "—",
    },
    {
      key: "floodStationCount",
      label: t("floodStations"),
      format: (row) => String(row.floodStationCount),
    },
    {
      key: "servicesCount",
      label: t("services"),
      format: (row) => String(row.servicesCount),
    },
    {
      key: "dengueCases",
      label: t("dengueCases"),
      format: (row) =>
        row.dengueCases != null ? row.dengueCases.toLocaleString() : "—",
    },
    {
      key: "costOfLivingIndex",
      label: t("costOfLiving"),
      format: (row) =>
        row.costOfLivingIndex != null ? String(row.costOfLivingIndex) : "—",
    },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-white/5">
          <tr>
            <th className="px-4 py-3 font-medium text-slate-400">{t("metric")}</th>
            {rows.map((row) => (
              <th key={row.slug} className="px-4 py-3 font-medium text-white">
                <Link
                  href={`/districts/${row.slug}`}
                  className="hover:text-teal-200"
                >
                  {row.name}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <tr key={metric.label} className="border-b border-white/5">
              <td className="px-4 py-3 text-slate-400">{metric.label}</td>
              {rows.map((row) => (
                <td key={`${row.slug}-${metric.label}`} className="px-4 py-3 text-slate-200">
                  {metric.format(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
