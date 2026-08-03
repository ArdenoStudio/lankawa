import { Link } from "@/i18n/navigation";
import {
  getLiveOutages,
  getLoadSheddingSchedule,
} from "@/lib/integrations/ceb-outages";
import { getSourceProvenancePath } from "@/lib/sources";

export async function CebLiveOutageStatusCard({ locale }: { locale: string }) {
  const [liveOutages, schedule] = await Promise.all([
    getLiveOutages(),
    getLoadSheddingSchedule(),
  ]);

  const isFallback = liveOutages.isFallback || schedule.isFallback;
  const disclaimer = liveOutages.disclaimer || schedule.disclaimer;
  const sourceId = liveOutages.sourceId;

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            CEB Outage Map & Load-Shedding Status
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Live breakdown outage map details and scheduled load-shedding letter groups (A–Y)
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {isFallback ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              {disclaimer}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live API Active
            </div>
          )}
          <Link
            href={getSourceProvenancePath(sourceId)}
            className="text-xs text-teal-300 hover:text-teal-200"
          >
            {sourceId === "ceb_outages_seed"
              ? "Source: /sources/ceb_outages_seed"
              : "Source: /sources/ceb_outages_api"}
          </Link>
        </div>
      </div>

      {/* Fallback Disclaimer Banner */}
      {isFallback && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-200">
          <p className="mb-0.5 font-semibold text-amber-100">
            ⚠️ Seed fallback — live API unavailable
          </p>
          <p>
            Upstream CEB Care API is offline or unreached. Displaying curated static seed dataset snapshot (`ceb-outages-seed.json`) with honest provenance linking.
          </p>
        </div>
      )}

      {/* Outage Map Details */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-200">
            Active Breakdown Outage Map Details ({liveOutages.outages.length} Areas Monitored)
          </h4>
          <span className="tabular-nums text-xs text-slate-400">
            Total Impacted: {liveOutages.totalCustomersAffected.toLocaleString()} customers
          </span>
        </div>

        {liveOutages.outages.length === 0 ? (
          <p className="rounded-xl border border-white/5 bg-black/20 p-4 text-center text-sm text-slate-500">
            No active grid breakdown outages reported across monitored areas.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {liveOutages.outages.map((outage) => (
              <div
                key={outage.id}
                className="space-y-1.5 rounded-xl border border-white/10 bg-black/20 p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    {outage.area}
                  </span>
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-medium text-rose-300">
                    {outage.interruptionType}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{outage.province}</p>
                <div className="flex items-center justify-between border-t border-white/5 pt-1 text-[11px] text-slate-500">
                  <span>{outage.affectedCustomers.toLocaleString()} customers</span>
                  <span>
                    {new Date(outage.timestamp).toLocaleTimeString(locale, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduled Load-Shedding Breakdown Groups A-Y */}
      <div className="pt-2">
        <h4 className="mb-3 text-sm font-medium text-slate-200">
          Scheduled Load-Shedding Rotation (Letter Groups A–Y)
        </h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {schedule.groups.map((group) => (
            <div
              key={group.group}
              className="rounded-xl border border-white/10 bg-black/30 p-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-xs font-bold text-teal-300">
                  {group.group}
                </span>
                <span className="text-[10px] text-slate-400">
                  {group.status}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-200">
                {group.startTime} – {group.endTime}
              </p>
              <p
                className="mt-0.5 truncate text-[11px] text-slate-400"
                title={group.affectedAreas.join(", ")}
              >
                {group.affectedAreas.join(", ")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Provenance Links */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-slate-500">
        <span>
          As of: {new Date(liveOutages.asOf).toLocaleString(locale)}
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/sources/ceb_outages_api"
            className="text-teal-300 hover:text-teal-200"
          >
            /sources/ceb_outages_api
          </Link>
          <span>·</span>
          <Link
            href="/sources/ceb_outages_seed"
            className="text-teal-300 hover:text-teal-200"
          >
            /sources/ceb_outages_seed
          </Link>
        </div>
      </div>
    </section>
  );
}
