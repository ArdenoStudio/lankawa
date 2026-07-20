"use client";

import { useMemo, useState } from "react";
import type { CatalogEndpoint, CatalogPackage } from "@/lib/api-docs-catalog";

export type LabRow = {
  pkg: CatalogPackage;
  endpoint: CatalogEndpoint;
};

type Props = {
  rows: LabRow[];
  initialPkg?: string;
  labels: {
    packageLabel: string;
    allPackages: string;
    styleLabel: string;
    paramsLabel: string;
    notesLabel: string;
    previewLabel: string;
    pageLabel: string;
    limitLabel: string;
    offsetLabel: string;
    groupLabel: string;
    empty: string;
    recipeTitle: string;
  };
};

function applyLabParams(
  url: string | undefined,
  style: string | undefined,
  values: { page: number; limit: number; offset: number; group: string },
): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    const styleKey = (style ?? "").toLowerCase();
    if (styleKey.includes("page_number")) {
      u.searchParams.set("page_number", String(values.page));
      u.searchParams.set("size", String(values.limit));
    } else if (styleKey.includes("page_limit") || styleKey.includes("limit_page")) {
      u.searchParams.set("page", String(values.page));
      u.searchParams.set("limit", String(values.limit));
    } else if (styleKey.includes("arcgis")) {
      u.searchParams.set("resultOffset", String(values.offset));
      u.searchParams.set("resultRecordCount", String(values.limit));
    } else if (styleKey.includes("group")) {
      u.searchParams.set("LoadShedGroupId", values.group);
    } else if (styleKey.includes("pagerequest")) {
      // body-based; show query hint only
      u.searchParams.set("lab_index", String(Math.max(0, values.page - 1)));
      u.searchParams.set("lab_limit", String(values.limit));
    } else if (styleKey.includes("client") || styleKey.includes("full_download")) {
      u.searchParams.set("lab_offset", String(values.offset));
      u.searchParams.set("lab_limit", String(values.limit));
    }
    return u.toString();
  } catch {
    return url;
  }
}

export function PaginationLab({ rows, initialPkg, labels }: Props) {
  const [pkgFilter, setPkgFilter] = useState(initialPkg ?? "all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [group, setGroup] = useState("A");

  const packages = useMemo(() => {
    const seen = new Map<string, string>();
    for (const row of rows) seen.set(row.pkg.slug, row.pkg.title);
    return [...seen.entries()];
  }, [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => (pkgFilter === "all" ? true : row.pkg.slug === pkgFilter)),
    [rows, pkgFilter],
  );

  const values = { page, limit, offset, group };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex flex-col gap-1 text-sm text-slate-400">
          {labels.packageLabel}
          <select
            value={pkgFilter}
            onChange={(e) => setPkgFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white"
          >
            <option value="all">{labels.allPackages}</option>
            {packages.map(([slug, title]) => (
              <option key={slug} value={slug}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-400">
          {labels.pageLabel}
          <input
            type="number"
            min={0}
            value={page}
            onChange={(e) => setPage(Number(e.target.value) || 0)}
            className="w-28 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-400">
          {labels.limitLabel}
          <input
            type="number"
            min={1}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) || 1)}
            className="w-28 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-400">
          {labels.offsetLabel}
          <input
            type="number"
            min={0}
            value={offset}
            onChange={(e) => setOffset(Number(e.target.value) || 0)}
            className="w-28 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-400">
          {labels.groupLabel}
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white"
          >
            {"ABCDEFGHIJKLMNOPQRSTUVWXY".split("").map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-slate-400">{labels.empty}</p>
      ) : (
        <ul className="space-y-4">
          {filtered.map(({ pkg, endpoint }) => {
            const style =
              endpoint.pagination && typeof endpoint.pagination === "object"
                ? endpoint.pagination.style
                : undefined;
            const notes =
              endpoint.pagination && typeof endpoint.pagination === "object"
                ? endpoint.pagination.notes
                : undefined;
            const params =
              endpoint.pagination && typeof endpoint.pagination === "object"
                ? endpoint.pagination.params
                : undefined;
            const preview = applyLabParams(endpoint.url, style, values);
            return (
              <li
                key={`${pkg.slug}:${endpoint.id}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                  <span>Tier {pkg.tier}</span>
                  <span>·</span>
                  <span>{pkg.slug}</span>
                </div>
                <h3 className="mt-2 text-lg font-medium text-white">
                  {endpoint.id}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    ({endpoint.method})
                  </span>
                </h3>
                <p className="mt-1 text-sm text-slate-400">{endpoint.summary}</p>
                <p className="mt-3 text-sm text-slate-300">
                  <span className="text-slate-500">{labels.styleLabel}: </span>
                  {style ?? "—"}
                </p>
                {params ? (
                  <p className="mt-1 text-sm text-slate-300">
                    <span className="text-slate-500">{labels.paramsLabel}: </span>
                    <code className="text-xs">{JSON.stringify(params)}</code>
                  </p>
                ) : null}
                {notes ? (
                  <p className="mt-1 text-sm text-slate-400">
                    <span className="text-slate-500">{labels.notesLabel}: </span>
                    {notes}
                  </p>
                ) : null}
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {labels.previewLabel}
                  </p>
                  <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950/80 p-3 text-xs text-slate-300">
                    {preview || endpoint.path}
                  </pre>
                </div>
                {endpoint.body_json != null ? (
                  <div className="mt-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {labels.recipeTitle}
                    </p>
                    <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950/80 p-3 text-xs text-slate-300">
                      {JSON.stringify(endpoint.body_json, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
