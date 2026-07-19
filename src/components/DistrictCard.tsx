"use client";

import { FreshnessBadge } from "@/components/FreshnessBadge";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { District } from "@/lib/types";

export function DistrictCard({
  district,
  locale,
}: {
  district: District;
  locale: string;
}) {
  const t = useTranslations("districts");

  return (
    <Link
      href={`/districts/${district.slug}`}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-teal-400/30 hover:bg-white/10"
    >
      <h3 className="text-lg font-semibold text-white">
        {getDistrictName(district, locale)}
      </h3>
      <p className="mt-1 text-sm text-slate-400">{district.province}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">{t("population")}</dt>
          <dd className="font-medium text-slate-200">
            {district.population.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">{t("area")}</dt>
          <dd className="font-medium text-slate-200">
            {district.areaSqKm.toLocaleString()} km²
          </dd>
        </div>
      </dl>
    </Link>
  );
}

export function DistrictGrid({
  locale,
  limit,
}: {
  locale: string;
  limit?: number;
}) {
  const districts = limit ? DISTRICTS.slice(0, limit) : DISTRICTS;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {districts.map((district) => (
        <DistrictCard key={district.slug} district={district} locale={locale} />
      ))}
    </div>
  );
}

export function SourceHealthList({
  sources,
}: {
  sources: Array<{
    id: string;
    name: string;
    tier: Parameters<typeof FreshnessBadge>[0]["tier"];
    error: string | null;
  }>;
}) {
  return (
    <ul className="space-y-3">
      {sources.map((source) => (
        <li
          key={source.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
        >
          <div>
            <p className="font-medium text-white">{source.name}</p>
            {source.error ? (
              <p className="text-xs text-rose-300">{source.error}</p>
            ) : null}
          </div>
          <FreshnessBadge tier={source.tier} />
        </li>
      ))}
    </ul>
  );
}
