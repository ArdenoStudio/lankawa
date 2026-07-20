"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getDistrict, getDistrictName } from "@/lib/districts";
import type { LandChangeDistrict } from "@/lib/land-change";

type YearKey = 2018 | 2024;

/** P41 — interactive 2018 ↔ 2024 greenery/built-up compare. */
export function LandChangeYearCompare({
  districts,
}: {
  districts: LandChangeDistrict[];
}) {
  const t = useTranslations("landChange");
  const locale = useLocale();
  const [year, setYear] = useState<YearKey>(2024);
  const [metric, setMetric] = useState<"greenery" | "builtUp">("greenery");

  const ranked = useMemo(() => {
    const withValue = districts.map((row) => {
      const value =
        metric === "greenery"
          ? year === 2018
            ? row.greenery2018
            : row.greenery2024
          : year === 2018
            ? row.builtUp2018
            : row.builtUp2024;
      return { row, value };
    });
    return withValue.sort((a, b) => b.value - a.value).slice(0, 8);
  }, [districts, metric, year]);

  const maxValue = Math.max(...ranked.map((item) => item.value), 1);

  return (
    <section className="space-y-4 rounded-2xl border border-white/15 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">
            {t("yearCompareTitle")}
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            {t("yearCompareSubtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div
            className="inline-flex rounded-full border border-white/15 p-0.5"
            role="group"
            aria-label={t("yearCompareYearLabel")}
          >
            {([2018, 2024] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setYear(item)}
                className={
                  year === item
                    ? "rounded-full bg-white px-3 py-1 text-xs font-medium text-black"
                    : "rounded-full px-3 py-1 text-xs font-medium text-neutral-300 hover:text-white"
                }
              >
                {item}
              </button>
            ))}
          </div>
          <div
            className="inline-flex rounded-full border border-white/15 p-0.5"
            role="group"
            aria-label={t("yearCompareMetricLabel")}
          >
            {(
              [
                ["greenery", t("yearCompareGreenery")],
                ["builtUp", t("yearCompareBuiltUp")],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMetric(key)}
                className={
                  metric === key
                    ? "rounded-full bg-white px-3 py-1 text-xs font-medium text-black"
                    : "rounded-full px-3 py-1 text-xs font-medium text-neutral-300 hover:text-white"
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className="space-y-2">
        {ranked.map(({ row, value }) => {
          const district = getDistrict(row.slug);
          const widthPct = (value / maxValue) * 100;
          return (
            <li key={row.slug} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <Link
                  href={`/districts/${row.slug}`}
                  className="text-white underline decoration-white/25 hover:decoration-white"
                >
                  {district ? getDistrictName(district, locale) : row.slug}
                </Link>
                <span className="tabular-nums text-neutral-300">{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white/80"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-neutral-500">{t("yearCompareHonesty")}</p>
    </section>
  );
}
