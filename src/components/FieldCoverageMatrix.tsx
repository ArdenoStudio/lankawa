"use client";

import { useMemo, useState } from "react";
import type { FieldCoverageDoc } from "@/lib/api-docs-field-coverage";

type Props = {
  doc: FieldCoverageDoc;
  labels: {
    domainLabel: string;
    allDomains: string;
    searchPlaceholder: string;
    legendTitle: string;
    empty: string;
    yCount: string;
    pCount: string;
  };
};

const CODE_CLASS: Record<string, string> = {
  Y: "bg-emerald-500/20 text-emerald-200",
  P: "bg-amber-500/20 text-amber-100",
  N: "bg-white/5 text-slate-500",
  K: "bg-rose-500/10 text-rose-200/80",
};

export function FieldCoverageMatrix({ doc, labels }: Props) {
  const domainIds = Object.keys(doc.domains);
  const [domainId, setDomainId] = useState(domainIds[0] ?? "");
  const [q, setQ] = useState("");

  const domain = doc.domains[domainId];

  const rows = useMemo(() => {
    if (!domain) return [];
    const query = q.trim().toLowerCase();
    return Object.entries(domain.packages)
      .filter(([slug]) => (query ? slug.includes(query) : true))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [domain, q]);

  if (!domain) {
    return <p className="text-slate-400">{labels.empty}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex flex-col gap-1 text-sm text-slate-400">
          {labels.domainLabel}
          <select
            value={domainId}
            onChange={(e) => setDomainId(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white"
          >
            {domainIds.map((id) => (
              <option key={id} value={id}>
                {doc.domains[id].title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm text-slate-400">
          {labels.searchPlaceholder}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none focus:border-white/30"
          />
        </label>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          {labels.legendTitle}
        </h2>
        <ul className="mt-2 flex flex-wrap gap-3 text-xs text-slate-300">
          {Object.entries(doc.legend).map(([code, meaning]) => (
            <li key={code} className="flex items-center gap-2">
              <span
                className={`rounded px-1.5 py-0.5 font-mono ${CODE_CLASS[code] ?? "bg-white/10"}`}
              >
                {code}
              </span>
              <span>{meaning}</span>
            </li>
          ))}
        </ul>
      </section>

      {rows.length === 0 ? (
        <p className="text-slate-400">{labels.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full border-collapse text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400">
              <tr>
                <th className="sticky left-0 bg-slate-950 px-3 py-2 font-medium">
                  Package
                </th>
                {domain.canonical_fields.map((field) => (
                  <th key={field} className="px-2 py-2 font-mono font-medium">
                    {field}
                  </th>
                ))}
                <th className="px-2 py-2">{labels.yCount}</th>
                <th className="px-2 py-2">{labels.pCount}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([slug, row]) => (
                <tr key={slug} className="border-t border-white/5">
                  <td className="sticky left-0 bg-slate-950/90 px-3 py-2 font-mono text-slate-200">
                    {slug}
                  </td>
                  {domain.canonical_fields.map((field) => {
                    const code = row.coverage[field] ?? "N";
                    return (
                      <td key={field} className="px-2 py-2 text-center">
                        <span
                          className={`inline-block min-w-[1.5rem] rounded px-1 py-0.5 font-mono ${CODE_CLASS[code] ?? ""}`}
                        >
                          {code}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center text-emerald-200">
                    {row.counts.Y ?? 0}
                  </td>
                  <td className="px-2 py-2 text-center text-amber-100">
                    {row.counts.P ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
