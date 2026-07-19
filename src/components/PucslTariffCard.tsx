"use client";

import { useState } from "react";
import { CitationCard } from "@/components/CitationCard";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import {
  estimateDomesticBill,
  type PucslTariffSnapshot,
} from "@/lib/pucsl";

export function PucslTariffCard({
  snapshot,
  labels,
  sourcePath,
  permalink,
  locale,
}: {
  snapshot: PucslTariffSnapshot;
  labels: {
    title: string;
    subtitle: string;
    effective: string;
    slab: string;
    energy: string;
    fixed: string;
    unitsLabel: string;
    estimateTitle: string;
    energyTotal: string;
    fixedTotal: string;
    billTotal: string;
    honesty: string;
    source: string;
    decision: string;
    none: string;
  };
  sourcePath: string;
  permalink?: string;
  locale: string;
}) {
  const [units, setUnits] = useState("90");
  const parsed = Number(units);
  const estimate =
    Number.isFinite(parsed) && parsed >= 0
      ? estimateDomesticBill(parsed)
      : null;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2 lg:col-span-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{labels.title}</h3>
            <FreshnessBadge tier="stale" />
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            {labels.subtitle}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {labels.effective}: {snapshot.effectiveFrom} · {snapshot.category}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {snapshot.tracks.map((track) => (
          <div
            key={track.id}
            className="overflow-x-auto rounded-xl border border-white/10"
          >
            <table className="min-w-full text-left text-sm">
              <caption className="border-b border-white/10 px-3 py-2 text-left text-xs font-semibold text-white">
                {track.label}
              </caption>
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">{labels.slab}</th>
                  <th className="px-3 py-2 font-medium">{labels.energy}</th>
                  <th className="px-3 py-2 font-medium">{labels.fixed}</th>
                </tr>
              </thead>
              <tbody>
                {track.slabs.map((slab) => (
                  <tr
                    key={slab.id}
                    className="border-t border-white/10 text-slate-300"
                  >
                    <td className="px-3 py-2 tabular-nums">
                      {slab.toKwh == null
                        ? `${slab.fromKwh}+`
                        : `${slab.fromKwh}–${slab.toKwh}`}{" "}
                      kWh
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {slab.energyLkrPerKwh.toLocaleString(locale, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {slab.fixedLkrPerMonth == null
                        ? labels.none
                        : slab.fixedLkrPerMonth.toLocaleString(locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/15 p-4">
        <h4 className="text-sm font-semibold text-white">
          {labels.estimateTitle}
        </h4>
        <label className="mt-3 block text-xs text-slate-500">
          {labels.unitsLabel}
          <input
            type="number"
            min={0}
            step={1}
            value={units}
            onChange={(event) => setUnits(event.target.value)}
            className="mt-1 w-full max-w-xs rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/40"
          />
        </label>
        {estimate ? (
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-slate-500">{labels.energyTotal}</dt>
              <dd className="mt-0.5 font-medium tabular-nums text-white">
                {estimate.energyLkr.toLocaleString(locale, {
                  maximumFractionDigits: 0,
                })}{" "}
                LKR
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{labels.fixedTotal}</dt>
              <dd className="mt-0.5 font-medium tabular-nums text-white">
                {estimate.fixedLkr.toLocaleString(locale)} LKR
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{labels.billTotal}</dt>
              <dd className="mt-0.5 text-xl font-semibold tabular-nums text-white">
                {estimate.totalLkr.toLocaleString(locale, {
                  maximumFractionDigits: 0,
                })}{" "}
                LKR
              </dd>
            </div>
          </dl>
        ) : null}
      </div>

      <footer className="mt-4 space-y-3 border-t border-white/10 pt-4">
        <p className="text-xs leading-relaxed text-slate-500">
          {labels.honesty}
        </p>
        <p className="text-xs text-slate-500">
          <Link
            href={sourcePath}
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {labels.source}
          </Link>
          {" · "}
          <a
            href={snapshot.decisionUrl}
            target="_blank"
            rel="noreferrer"
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {labels.decision}
          </a>
        </p>
        <CitationCard
          title={labels.title}
          value={
            estimate
              ? `~${estimate.totalLkr.toLocaleString(locale)} LKR for ${estimate.unitsKwh} kWh`
              : snapshot.effectiveFrom
          }
          observedAt={snapshot.asOf}
          sourceName={snapshot.sourceName}
          sourcePath={sourcePath}
          permalink={permalink}
        />
      </footer>
    </article>
  );
}
