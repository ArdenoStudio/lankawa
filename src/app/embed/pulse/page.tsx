import { buildPulseSnapshot } from "@/lib/pulse";

export const dynamic = "force-dynamic";

export default async function EmbedPulsePage() {
  const snapshot = await buildPulseSnapshot();

  return (
    <div className="min-h-screen p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-teal-300">
        Lankawa Pulse
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {snapshot.metrics.slice(0, 4).map((metric) => (
          <article
            key={metric.id}
            className="rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <p className="text-xs text-slate-400">{metric.label}</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {metric.value}
              {metric.unit ? (
                <span className="ml-1 text-sm font-normal text-slate-400">
                  {metric.unit}
                </span>
              ) : null}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
