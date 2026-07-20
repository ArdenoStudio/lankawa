"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { colShadeBucket, maxColIndex } from "@/lib/col-choropleth";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import type { CostOfLivingSnapshot } from "@/lib/types";

/** Simple SVG table-map (P33) — monochrome buckets, no MapLibre mosaics. */
export function ColDistrictChoropleth({
  snapshot,
}: {
  snapshot: CostOfLivingSnapshot;
}) {
  const t = useTranslations("costOfLiving");
  const locale = useLocale();
  const maxIndex = maxColIndex(snapshot.districts);
  const sorted = [...snapshot.districts].sort((a, b) => a.rank - b.rank);

  const cols = 5;
  const cell = 56;
  const gap = 6;
  const rows = Math.ceil(sorted.length / cols);
  const width = cols * cell + (cols - 1) * gap;
  const height = rows * cell + (rows - 1) * gap;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">{t("choroplethTitle")}</h2>
        <p className="mt-1 text-sm text-slate-400">{t("choroplethSubtitle")}</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto h-auto w-full max-w-lg text-white"
          role="img"
          aria-label={t("choroplethTitle")}
        >
          {sorted.map((district, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = col * (cell + gap);
            const y = row * (cell + gap);
            const bucket = colShadeBucket(district.index, maxIndex);
            const opacity = 0.15 + bucket * 0.18;
            const meta = DISTRICTS.find((d) => d.slug === district.slug);
            const label = meta ? getDistrictName(meta, locale) : district.slug;
            return (
              <g key={district.slug}>
                <title>
                  {label}: {district.index}
                </title>
                <rect
                  x={x}
                  y={y}
                  width={cell}
                  height={cell}
                  rx={4}
                  fill="currentColor"
                  opacity={opacity}
                />
                <text
                  x={x + cell / 2}
                  y={y + cell / 2 - 4}
                  textAnchor="middle"
                  className="fill-white text-[9px]"
                  fill="white"
                >
                  {district.slug.slice(0, 6)}
                </text>
                <text
                  x={x + cell / 2}
                  y={y + cell / 2 + 10}
                  textAnchor="middle"
                  className="fill-white text-[10px] font-semibold"
                  fill="white"
                >
                  {district.index}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.slice(0, 6).map((district) => {
          const meta = DISTRICTS.find((d) => d.slug === district.slug);
          return (
            <li
              key={district.slug}
              className="flex items-center justify-between gap-2 text-sm text-slate-300"
            >
              <Link
                href={`/districts/${district.slug}`}
                className="text-white underline decoration-white/25 hover:decoration-white"
              >
                {meta ? getDistrictName(meta, locale) : district.slug}
              </Link>
              <span className="tabular-nums text-white">{district.index}</span>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-slate-500">{t("choroplethHonesty")}</p>
    </section>
  );
}
