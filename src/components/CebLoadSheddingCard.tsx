import { Link } from "@/i18n/navigation";
import {
  getLoadSheddingSchedule,
  getLiveOutages,
} from "@/lib/integrations/ceb-outages";
import { getSourceProvenancePath } from "@/lib/sources";

export async function CebLoadSheddingCard() {
  const [scheduleResult, outagesResult] = await Promise.all([
    getLoadSheddingSchedule(),
    getLiveOutages(),
  ]);

  const isFallback = scheduleResult.isFallback || outagesResult.isFallback;
  const disclaimer = scheduleResult.disclaimer || outagesResult.disclaimer;
  const sourceId = scheduleResult.sourceId;

  return (
    <div
      id="ceb-load-shedding"
      className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            CEB Outage & Load-Shedding Schedule (Groups A–Y)
          </h3>
          <p className="text-xs text-slate-400">
            Live grid breakdown status & rotational load-management schedule windows
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFallback ? (
            <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
              {disclaimer}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-300">
              Live Feed Connected
            </span>
          )}
          <Link
            href={getSourceProvenancePath(sourceId)}
            className="text-xs text-teal-300 hover:text-teal-200"
          >
            Source
          </Link>
        </div>
      </div>

      {/* Outage & Schedule Metrics Overview */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-white/5 bg-black/20 p-3">
          <p className="text-xs text-slate-400">Active Breakdowns</p>
          <p className="mt-1 text-xl font-bold text-white">
            {outagesResult.outages.length} Areas
          </p>
          <p className="text-[11px] text-slate-500">
            {outagesResult.totalCustomersAffected.toLocaleString()} customers affected
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-black/20 p-3">
          <p className="text-xs text-slate-400">Load-Shedding Coverage</p>
          <p className="mt-1 text-xl font-bold text-white">
            {scheduleResult.groups.length} Groups (A–Y)
          </p>
          <p className="text-[11px] text-slate-500">
            {scheduleResult.groups
              .reduce((acc, g) => acc + g.customerCount, 0)
              .toLocaleString()}{" "}
            accounts scheduled
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-black/20 p-3 sm:col-span-2 lg:col-span-1">
          <p className="text-xs text-slate-400">As Of Timestamp</p>
          <p className="mt-1 text-sm font-semibold text-slate-200">
            {new Date(scheduleResult.asOf).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">CEB Care Incognito Portal</p>
        </div>
      </div>

      {/* Schedule Breakdown Groups A-Y */}
      <div>
        <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Scheduled Rotation Windows for Letter Groups A–Y
        </h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {scheduleResult.groups.map((group) => (
            <div
              key={group.group}
              className="rounded-xl border border-white/10 bg-black/30 p-2.5 transition-colors hover:border-teal-500/40"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-xs font-bold text-teal-300">
                  {group.group}
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {(group.customerCount / 1000).toFixed(0)}k cust.
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

      <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs text-slate-500">
        <span>CEB Care Incognito · Rotational load management schedule</span>
        <Link
          href={getSourceProvenancePath(sourceId)}
          className="text-teal-400 hover:text-teal-300"
        >
          {sourceId} →
        </Link>
      </div>
    </div>
  );
}
