"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import {
  DEFAULT_TENDER_CLOSING_DAYS,
  daysUntilTenderClose,
  filterTendersClosingWithin,
} from "@/lib/tender-closing";
import type { TenderNotice, TenderStatus } from "@/lib/types";

export function TenderFeed({
  initialDistrict,
  initialQuery,
  initialStatus,
  ministryLabels,
  notices,
}: {
  initialDistrict?: string;
  initialQuery?: string;
  initialStatus?: TenderStatus | "";
  ministryLabels: Record<string, string>;
  notices: TenderNotice[];
}) {
  const t = useTranslations("tenders");
  const [query, setQuery] = useState(initialQuery ?? "");
  const [district, setDistrict] = useState(initialDistrict ?? "");
  const [status, setStatus] = useState<TenderStatus | "">(initialStatus ?? "");
  const [closingSoonOnly, setClosingSoonOnly] = useState(
    initialStatus === "closing_soon",
  );

  const results = useMemo(() => {
    const base = closingSoonOnly
      ? filterTendersClosingWithin(notices, DEFAULT_TENDER_CLOSING_DAYS)
      : notices;

    return base.filter((notice) => {
      const normalizedQuery = query.trim().toLowerCase();
      if (district && notice.district !== district) {
        return false;
      }
      if (!closingSoonOnly && status && notice.status !== status) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }

      return [
        notice.title,
        notice.reference,
        notice.ministry,
        notice.district,
        notice.province,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [query, district, status, notices, closingSoonOnly]);

  function formatValue(value: number): string {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    return value.toLocaleString();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="min-w-[200px] flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/40 focus:outline-none"
        />
        <select
          value={district}
          onChange={(event) => setDistrict(event.target.value)}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
        >
          <option value="">{t("allDistricts")}</option>
          {DISTRICTS.map((item) => (
            <option key={item.slug} value={item.slug}>
              {getDistrictName(item, "en")}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => {
            const next = event.target.value as TenderStatus | "";
            setStatus(next);
            setClosingSoonOnly(next === "closing_soon");
          }}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="open">{t("statusOpen")}</option>
          <option value="closing_soon">{t("statusClosingSoon")}</option>
          <option value="closed">{t("statusClosed")}</option>
        </select>
        <button
          type="button"
          onClick={() => {
            const next = !closingSoonOnly;
            setClosingSoonOnly(next);
            setStatus(next ? "closing_soon" : "");
          }}
          aria-pressed={closingSoonOnly}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            closingSoonOnly
              ? "border-white bg-white text-black"
              : "border-white/20 text-neutral-200 hover:border-white/40"
          }`}
        >
          {t("closingSoonPin", { days: DEFAULT_TENDER_CLOSING_DAYS })}
        </button>
      </div>

      <p className="text-sm text-slate-400">{t("resultsCount", { count: results.length })}</p>

      {results.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-400">
          {t("noResults")}
        </p>
      ) : (
        <ul className="space-y-3">
          {results.map((notice: TenderNotice) => (
            <li
              key={notice.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-white">{notice.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{notice.reference}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    notice.status === "open"
                      ? "bg-teal-500/20 text-teal-200"
                      : notice.status === "closing_soon"
                        ? "bg-amber-500/20 text-amber-200"
                        : "bg-slate-500/20 text-slate-300"
                  }`}
                >
                  {t(`status_${notice.status}`)}
                </span>
              </div>
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-slate-500">{t("ministry")}</dt>
                  <dd className="text-slate-200">
                    {ministryLabels[notice.ministry] ?? notice.ministry}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("district")}</dt>
                  <dd>
                    <Link
                      href={`/districts/${notice.district}`}
                      className="text-teal-300 hover:text-teal-200"
                    >
                      {notice.district}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("estimatedValue")}</dt>
                  <dd className="text-slate-200">
                    LKR {formatValue(notice.estimatedValueLkr)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("closingDate")}</dt>
                  <dd className="text-slate-200">
                    {notice.closingDate}
                    {(() => {
                      const days = daysUntilTenderClose(notice.closingDate);
                      if (days == null || days < 0 || days > DEFAULT_TENDER_CLOSING_DAYS) {
                        return null;
                      }
                      return (
                        <span className="ml-2 text-xs text-neutral-400">
                          {t("closesInDays", { days })}
                        </span>
                      );
                    })()}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
