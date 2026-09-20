"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { ApiDocsCatalog, CatalogPackage } from "@/lib/api-docs-catalog";

type Props = {
  catalog: ApiDocsCatalog;
  labels: {
    searchPlaceholder: string;
    tierAll: string;
    categoryAll: string;
    tierLabel: string;
    categoryLabel: string;
    endpoints: string;
    paginationLab: string;
    extractTo: string;
    empty: string;
    openLab: string;
  };
};

export function ApiCatalogExplorer({ catalog, labels }: Props) {
  const [tier, setTier] = useState("all");
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");

  const categories = Object.keys(catalog.categories);

  const packages = useMemo(() => {
    const query = q.trim().toLowerCase();
    return catalog.packages.filter((pkg) => {
      if (tier !== "all" && pkg.tier !== tier) return false;
      if (category !== "all" && pkg.category !== category) return false;
      if (!query) return true;
      const hay = [
        pkg.slug,
        pkg.title,
        pkg.summary,
        pkg.host,
        ...pkg.endpoints.map((e) => `${e.id} ${e.summary}`),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [catalog.packages, tier, category, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm text-slate-400">
          {labels.searchPlaceholder}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-white/30"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-400">
          {labels.tierLabel}
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white"
          >
            <option value="all">{labels.tierAll}</option>
            <option value="A">A — {catalog.tiers.A}</option>
            <option value="B">B — {catalog.tiers.B}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-400">
          {labels.categoryLabel}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white"
          >
            <option value="all">{labels.categoryAll}</option>
            {categories.map((key) => (
              <option key={key} value={key}>
                {catalog.categories[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm text-slate-400">
        {packages.length} / {catalog.package_count}
      </p>

      {packages.length === 0 ? (
        <p className="text-slate-400">{labels.empty}</p>
      ) : (
        <ul className="space-y-3">
          {packages.map((pkg) => (
            <PackageRow key={pkg.slug} pkg={pkg} labels={labels} categories={catalog.categories} />
          ))}
        </ul>
      )}
    </div>
  );
}

function PackageRow({
  pkg,
  labels,
  categories,
}: {
  pkg: CatalogPackage;
  labels: Props["labels"];
  categories: Record<string, string>;
}) {
  return (
    <li className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-200">
          Tier {pkg.tier}
        </span>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400">
          {categories[pkg.category] ?? pkg.category}
        </span>
        {pkg.pagination_lab.length > 0 ? (
          <span className="rounded-full border border-teal-500/30 px-2 py-0.5 text-xs text-teal-200">
            {labels.paginationLab}
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 text-lg font-medium text-white">{pkg.title}</h3>
      <p className="mt-1 text-sm text-slate-400">{pkg.summary}</p>
      <p className="mt-2 font-mono text-xs text-slate-500">{pkg.slug}</p>
      <p className="mt-1 text-xs text-slate-500">
        {labels.endpoints}: {pkg.endpoint_count} · {pkg.host}
      </p>
      {pkg.extract_to ? (
        <p className="mt-1 text-xs text-slate-500">
          {labels.extractTo}: <code>{pkg.extract_to}</code>
        </p>
      ) : null}
      <ul className="mt-3 space-y-1 border-t border-white/5 pt-3">
        {pkg.endpoints.slice(0, 6).map((ep) => (
          <li key={ep.id} className="flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="font-semibold uppercase text-slate-300">{ep.method}</span>
            <code className="text-slate-300">{ep.path}</code>
            <span className="text-slate-500">{ep.summary}</span>
          </li>
        ))}
        {pkg.endpoints.length > 6 ? (
          <li className="text-xs text-slate-500">+{pkg.endpoints.length - 6} more</li>
        ) : null}
      </ul>
      {pkg.pagination_lab.length > 0 ? (
        <Link
          href={`/developers/api-catalog/pagination-lab?pkg=${encodeURIComponent(pkg.slug)}`}
          className="mt-4 inline-block text-sm text-teal-300 hover:text-teal-200"
        >
          {labels.openLab}
        </Link>
      ) : null}
    </li>
  );
}
