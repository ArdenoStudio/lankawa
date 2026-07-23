"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { DistrictMorningPackData } from "@/lib/district-morning";
import { getDistrict, getDistrictName } from "@/lib/districts";
import { HOME_DISTRICT_EVENT, readHomeDistrict } from "@/lib/preferences";

const DEMO_SLUG = "colombo";

export function DistrictMorningPack({
  packs,
  locale,
}: {
  packs: Record<string, DistrictMorningPackData>;
  locale: string;
}) {
  const t = useTranslations("districtMorning");
  const [slug, setSlug] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return readHomeDistrict(window.localStorage);
  });

  useEffect(() => {
    function onPin(event: Event) {
      const detail = (event as CustomEvent<string | null>).detail;
      setSlug(detail ?? null);
    }

    window.addEventListener(HOME_DISTRICT_EVENT, onPin);
    return () => window.removeEventListener(HOME_DISTRICT_EVENT, onPin);
  }, []);

  const pinnedSlug = slug && packs[slug] ? slug : null;
  const activeSlug = pinnedSlug ?? DEMO_SLUG;
  const pack = packs[activeSlug];
  const district = getDistrict(activeSlug);
  const isDemo = pinnedSlug == null;

  if (!pack || !district) {
    return null;
  }

  const districtName = getDistrictName(district, locale);

  let colNoteLabel = "—";
  if (pack.colNote) {
    const vs =
      pack.colNote.vsNational === 0
        ? t("colAtNational")
        : pack.colNote.vsNational > 0
          ? t("colAboveNational", { value: pack.colNote.vsNational })
          : t("colBelowNational", { value: Math.abs(pack.colNote.vsNational) });
    colNoteLabel = t("colNoteValue", {
      index: pack.colNote.index,
      rank: pack.colNote.rank,
      vs,
    });
  }

  return (
    <section className="rounded-2xl border border-white/15 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            {isDemo
              ? t("demoNote", { district: districtName })
              : t("pinnedSubtitle", { district: districtName })}
          </p>
        </div>
        {isDemo ? (
          <p className="text-xs text-neutral-500">{t("pinHint")}</p>
        ) : null}
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-neutral-500">{t("dengue")}</dt>
          <dd className="mt-1 flex items-baseline gap-2 text-lg font-semibold text-white">
            <span>
              {pack.dengue != null ? pack.dengue.toLocaleString(locale) : "—"}
            </span>
            {pack.dengue != null ? (
              <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                {pack.dengueIsSeed ? t("seed") : t("live")}
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">{t("aqi")}</dt>
          <dd className="mt-1 flex items-baseline gap-2 text-lg font-semibold text-white">
            <span>{pack.aqi != null ? pack.aqi : "—"}</span>
            {pack.aqi != null ? (
              <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                {pack.aqiIsSeed ? t("seed") : t("live")}
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">{t("colNote")}</dt>
          <dd className="mt-1 text-sm font-medium text-neutral-200">
            {colNoteLabel}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">{t("landDelta")}</dt>
          <dd className="mt-1 flex items-baseline gap-2 text-lg font-semibold text-white">
            <span>
              {pack.landDelta != null
                ? `${pack.landDelta > 0 ? "+" : ""}${pack.landDelta}`
                : "—"}
            </span>
            {pack.landDelta != null ? (
              <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                {pack.landIsSeed ? t("seed") : t("live")}
              </span>
            ) : null}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-sm text-neutral-400">
        <Link
          href={`/districts/${activeSlug}`}
          className="text-teal-300 hover:text-teal-200"
        >
          {t("openDistrict")}
        </Link>
        {isDemo ? (
          <>
            {" · "}
            <span>{t("pinHint")}</span>
          </>
        ) : null}
      </p>
    </section>
  );
}
