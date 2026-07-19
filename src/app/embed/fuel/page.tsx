import { buildPulseSnapshot } from "@/lib/pulse";

export const dynamic = "force-dynamic";

export default async function EmbedFuelPage() {
  const snapshot = await buildPulseSnapshot();
  const fuel = snapshot.metrics.filter((metric) => metric.id.startsWith("fuel_"));

  return (
    <div className="min-h-screen p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-teal-300">
        Lankawa Fuel
      </p>
      <div className="grid gap-3">
        {fuel.map((metric) => (
          <article
            key={metric.id}
            className="rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <p className="text-xs text-slate-400">{metric.label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {metric.value}{" "}
              <span className="text-sm font-normal text-slate-400">{metric.unit}</span>
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
