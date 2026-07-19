"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import {
  getAllAirports,
  getAllBusRoutes,
  getAllRailwayStations,
  getTransportName,
} from "@/lib/transport";

type Tab = "bus" | "rail" | "air";

export function TransportDirectory({
  initialDistrict,
  initialQuery,
}: {
  initialDistrict?: string;
  initialQuery?: string;
}) {
  const t = useTranslations("transport");
  const locale = useLocale();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [districtFilter, setDistrictFilter] = useState(initialDistrict ?? "all");
  const [tab, setTab] = useState<Tab>("bus");

  const district = districtFilter === "all" ? undefined : districtFilter;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const routes = getAllBusRoutes().filter((route) => {
      if (district) {
        const touches =
          route.originDistrict === district ||
          route.destinationDistrict === district ||
          route.viaDistricts.includes(district);
        if (!touches) {
          return false;
        }
      }
      if (!normalized) {
        return true;
      }
      return [route.name, route.routeNumber, route.operator]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });

    const stations = getAllRailwayStations().filter((station) => {
      if (district && station.districtSlug !== district) {
        return false;
      }
      if (!normalized) {
        return true;
      }
      return [station.name, station.line].join(" ").toLowerCase().includes(normalized);
    });

    const airports = getAllAirports().filter((airport) => {
      if (district && airport.districtSlug !== district) {
        return false;
      }
      if (!normalized) {
        return true;
      }
      return [airport.name, airport.iata].join(" ").toLowerCase().includes(normalized);
    });

    return { routes, stations, airports };
  }, [district, query]);

  const tabs: Tab[] = ["bus", "rail", "air"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/40 focus:outline-none sm:max-w-xs"
        />
        <select
          value={districtFilter}
          onChange={(event) => setDistrictFilter(event.target.value)}
          className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white"
        >
          <option value="all">{t("allDistricts")}</option>
          {DISTRICTS.map((d) => (
            <option key={d.slug} value={d.slug}>
              {getDistrictName(d, locale)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              tab === item
                ? "bg-teal-500/20 text-teal-200"
                : "border border-white/10 text-slate-300 hover:bg-white/5"
            }`}
          >
            {t(`tab_${item}`)}
          </button>
        ))}
      </div>

      {tab === "bus" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.routes.map((route) => (
            <article
              key={route.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-white">
                  {getTransportName(route, locale)}
                </p>
                <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-xs text-teal-100">
                  {route.routeNumber}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {route.operator} · {route.frequency}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {(() => {
                  const origin = DISTRICTS.find((d) => d.slug === route.originDistrict);
                  const dest = DISTRICTS.find(
                    (d) => d.slug === route.destinationDistrict,
                  );
                  if (!origin || !dest) {
                    return `${route.originDistrict} → ${route.destinationDistrict}`;
                  }
                  return `${getDistrictName(origin, locale)} → ${getDistrictName(dest, locale)}`;
                })()}
              </p>
            </article>
          ))}
          {filtered.routes.length === 0 ? (
            <p className="col-span-full text-sm text-slate-400">{t("noResults")}</p>
          ) : null}
        </div>
      ) : null}

      {tab === "rail" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.stations.map((station) => {
            const d = DISTRICTS.find((item) => item.slug === station.districtSlug);
            return (
              <article
                key={station.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <p className="font-medium text-white">
                  {getTransportName(station, locale)}
                </p>
                <p className="mt-1 text-xs text-slate-400">{station.line}</p>
                {d ? (
                  <Link
                    href={`/districts/${d.slug}`}
                    className="mt-3 inline-flex text-xs text-teal-300 hover:text-teal-200"
                  >
                    {getDistrictName(d, locale)} →
                  </Link>
                ) : null}
              </article>
            );
          })}
          {filtered.stations.length === 0 ? (
            <p className="col-span-full text-sm text-slate-400">{t("noResults")}</p>
          ) : null}
        </div>
      ) : null}

      {tab === "air" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.airports.map((airport) => {
            const d = DISTRICTS.find((item) => item.slug === airport.districtSlug);
            return (
              <article
                key={airport.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-white">
                    {getTransportName(airport, locale)}
                  </p>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-300">
                    {airport.iata}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {airport.isInternational ? t("international") : t("domestic")}
                </p>
                {d ? (
                  <Link
                    href={`/districts/${d.slug}`}
                    className="mt-3 inline-flex text-xs text-teal-300 hover:text-teal-200"
                  >
                    {getDistrictName(d, locale)} →
                  </Link>
                ) : null}
              </article>
            );
          })}
          {filtered.airports.length === 0 ? (
            <p className="col-span-full text-sm text-slate-400">{t("noResults")}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
