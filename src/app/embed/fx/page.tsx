import { buildPulseSnapshot } from "@/lib/pulse";

export const dynamic = "force-dynamic";

export default async function EmbedFxPage() {
  const snapshot = await buildPulseSnapshot();
  const fx = snapshot.metrics.find((metric) => metric.id === "usd_lkr");

  return (
    <div className="min-h-screen p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-teal-300">
        Lankawa FX
      </p>
      {fx ? (
        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">{fx.label}</p>
          <p className="mt-1 text-3xl font-semibold text-white">
            {fx.value}{" "}
            <span className="text-sm font-normal text-slate-400">{fx.unit}</span>
          </p>
        </article>
      ) : (
        <p className="text-sm text-slate-400">FX data temporarily unavailable.</p>
      )}
    </div>
  );
}
