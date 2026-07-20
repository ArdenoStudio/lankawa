"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import { formatVehiclePrice } from "@/lib/vehicle";
import {
  filterVehicleModels,
  getVehicleModelDeepDive,
  uniqueVehicleMakes,
  uniqueVehicleModelDistricts,
} from "@/lib/vehicle-models";

export function VehicleModelDeepDive() {
  const t = useTranslations("vehicles");
  const locale = useLocale();
  const snapshot = getVehicleModelDeepDive();
  const makes = uniqueVehicleMakes();
  const districtSlugs = uniqueVehicleModelDistricts();
  const [district, setDistrict] = useState<string>("all");
  const [make, setMake] = useState<string>("all");

  const rows = useMemo(
    () =>
      filterVehicleModels({
        districtSlug: district === "all" ? undefined : district,
        make: make === "all" ? undefined : make,
      }).sort((a, b) => b.listingCount - a.listingCount),
    [district, make],
  );

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">{t("modelDiveTitle")}</h2>
        <p className="mt-1 text-sm text-slate-400">{t("modelDiveSubtitle")}</p>
        <p className="mt-2 text-xs text-slate-500">
          {t("asOf", { date: snapshot.asOf })} · {t("modelDiveSeed")}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <select
          value={district}
          onChange={(event) => setDistrict(event.target.value)}
          className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white"
          aria-label={t("modelDiveDistrict")}
        >
          <option value="all">{t("modelDiveAllDistricts")}</option>
          {districtSlugs.map((slug) => {
            const item = DISTRICTS.find((d) => d.slug === slug);
            return (
              <option key={slug} value={slug}>
                {item ? getDistrictName(item, locale) : slug}
              </option>
            );
          })}
        </select>
        <select
          value={make}
          onChange={(event) => setMake(event.target.value)}
          className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white"
          aria-label={t("modelDiveMake")}
        >
          <option value="all">{t("modelDiveAllMakes")}</option>
          {makes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("modelDiveMake")}</th>
              <th className="px-4 py-3 font-medium">{t("modelDiveModel")}</th>
              <th className="px-4 py-3 font-medium">{t("district")}</th>
              <th className="px-4 py-3 font-medium">{t("medianPrice")}</th>
              <th className="px-4 py-3 font-medium">{t("listings")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const districtRow = DISTRICTS.find(
                (d) => d.slug === row.districtSlug,
              );
              return (
                <tr
                  key={`${row.make}-${row.model}-${row.districtSlug}`}
                  className="border-t border-white/10 text-slate-300"
                >
                  <td className="px-4 py-2.5 text-white">{row.make}</td>
                  <td className="px-4 py-2.5">{row.model}</td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/districts/${row.districtSlug}`}
                      className="text-teal-300 hover:text-teal-200"
                    >
                      {districtRow
                        ? getDistrictName(districtRow, locale)
                        : row.districtSlug}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-white">
                    LKR {formatVehiclePrice(row.medianPriceLkr)}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums">
                    {row.listingCount.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">{t("modelDiveEmpty")}</p>
      ) : null}

      <p className="text-xs text-slate-500">{t("modelDiveHonesty")}</p>
    </section>
  );
}
