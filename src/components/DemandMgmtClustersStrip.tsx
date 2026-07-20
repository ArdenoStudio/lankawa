import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  fetchDemandMgmtClustersSnapshot,
  formatCustomerCount,
} from "@/lib/integrations/demand-mgmt-clusters";
import { getSourceProvenancePath } from "@/lib/sources";

export async function DemandMgmtClustersStrip() {
  const t = await getTranslations("demandMgmtClusters");
  const snapshot = await fetchDemandMgmtClustersSnapshot();

  return (
    <section
      id="demand-mgmt-clusters"
      className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5"
      aria-labelledby="demand-mgmt-clusters-title"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3
            id="demand-mgmt-clusters-title"
            className="text-sm font-medium text-slate-300"
          >
            {t("title")}
          </h3>
          <p className="mt-1 text-xs text-slate-500">{t("subtitle")}</p>
        </div>
        <span className="text-xs uppercase tracking-[0.14em] text-slate-500">
          {snapshot.isSeed ? t("seed") : t("live")}
        </span>
      </div>

      <p className="text-sm text-slate-300">
        {t("totals", {
          groups: snapshot.groups.length,
          clusters: snapshot.totalClusters.toLocaleString("en-LK"),
          customers: formatCustomerCount(snapshot.totalCustomers),
        })}
      </p>

      <ul className="flex flex-wrap gap-2">
        {snapshot.groups.map((group) => (
          <li
            key={group.groupId}
            className="min-w-[3.25rem] border border-white/10 bg-black/20 px-2 py-1.5 text-center"
            title={t("groupTitle", {
              group: group.groupId,
              clusters: group.clusterCount,
              customers: group.customerCount.toLocaleString("en-LK"),
            })}
          >
            <p className="text-xs font-semibold text-white">{group.groupId}</p>
            <p className="text-[11px] tabular-nums text-slate-400">
              {formatCustomerCount(group.customerCount)}
            </p>
          </li>
        ))}
      </ul>

      <footer className="space-y-1 text-xs text-slate-500">
        <p>{t("honesty")}</p>
        <p>
          {t("asOf", { date: snapshot.asOf })} ·{" "}
          <Link
            href={getSourceProvenancePath(snapshot.sourceId)}
            className="text-teal-300 hover:text-teal-200"
          >
            {t("source")}
          </Link>
        </p>
      </footer>
    </section>
  );
}
