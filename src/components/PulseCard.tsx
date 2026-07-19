import { FreshnessBadge } from "./FreshnessBadge";
import type { PulseMetric } from "@/lib/types";

export function PulseCard({ metric }: { metric: PulseMetric }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-300">{metric.label}</h3>
        <FreshnessBadge tier={metric.tier} />
      </div>
      <p className="text-3xl font-semibold tracking-tight text-white">
        {metric.value}
        {metric.unit ? (
          <span className="ml-2 text-base font-normal text-slate-400">
            {metric.unit}
          </span>
        ) : null}
      </p>
      {metric.note ? (
        <p className="mt-2 text-sm text-slate-400">{metric.note}</p>
      ) : null}
      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          {metric.observedAt
            ? new Date(metric.observedAt).toLocaleString()
            : "No timestamp"}
        </span>
        <a
          href={metric.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-teal-300 hover:text-teal-200"
        >
          Source
        </a>
      </footer>
    </article>
  );
}
