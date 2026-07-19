import { buildPulseSnapshot, getTodayPulseMetrics } from "@/lib/pulse";

export const dynamic = "force-dynamic";

export default async function EmbedTodayPage() {
  const snapshot = await buildPulseSnapshot();
  const metrics = getTodayPulseMetrics(snapshot.metrics);

  return (
    <div className="min-h-screen p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-white">
          Lankawa Today
        </p>
        <p className="text-[11px] text-slate-500">
          {new Date(snapshot.generatedAt).toLocaleString("en-LK", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <article
            key={metric.id}
            className="rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs text-slate-400">{metric.label}</p>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                {metric.tier}
              </span>
            </div>
            <p className="mt-1 text-2xl font-semibold text-white">
              {metric.value}
              {metric.unit ? (
                <span className="ml-1 text-sm font-normal text-slate-400">
                  {metric.unit}
                </span>
              ) : null}
            </p>
            {metric.note ? (
              <p className="mt-2 line-clamp-2 text-[11px] text-slate-500">
                {metric.note}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
