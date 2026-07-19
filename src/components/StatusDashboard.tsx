"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import type { FreshnessTier } from "@/lib/types";

export interface StatusSourceRow {
  id: string;
  name: string;
  category: string;
  tier: FreshnessTier;
  lastCheckedAt: string | null;
  lastSuccessAt: string | null;
  error: string | null;
  provenancePath: string;
}

export function StatusDashboard({ sources }: { sources: StatusSourceRow[] }) {
  const t = useTranslations("status");
  const tierOrder: FreshnessTier[] = ["down", "stale", "unknown", "fresh"];

  const sorted = [...sources].sort(
    (a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier),
  );

  const counts = sources.reduce(
    (acc, source) => {
      acc[source.tier] = (acc[source.tier] ?? 0) + 1;
      return acc;
    },
    {} as Record<FreshnessTier, number>,
  );

  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(["fresh", "stale", "down", "unknown"] as const).map((tier) => (
          <div
            key={tier}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <dt className="text-sm text-slate-500">{t(`tierCount.${tier}`)}</dt>
            <dd className="mt-2 flex items-center gap-2">
              <span className="text-3xl font-semibold text-white">
                {counts[tier] ?? 0}
              </span>
              <FreshnessBadge tier={tier} />
            </dd>
          </div>
        ))}
      </dl>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">{t("table.source")}</th>
              <th className="px-4 py-3 font-medium">{t("table.category")}</th>
              <th className="px-4 py-3 font-medium">{t("table.freshness")}</th>
              <th className="px-4 py-3 font-medium">{t("table.lastChecked")}</th>
              <th className="px-4 py-3 font-medium">{t("table.lastSuccess")}</th>
              <th className="px-4 py-3 font-medium">{t("table.error")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map((source) => (
              <tr key={source.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Link
                    href={source.provenancePath}
                    className="font-medium text-teal-300 hover:text-teal-200"
                  >
                    {source.name}
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize text-slate-300">
                  {source.category}
                </td>
                <td className="px-4 py-3">
                  <FreshnessBadge tier={source.tier} />
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {source.lastCheckedAt
                    ? new Date(source.lastCheckedAt).toLocaleString()
                    : "—"}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {source.lastSuccessAt
                    ? new Date(source.lastSuccessAt).toLocaleString()
                    : "—"}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-rose-300/80">
                  {source.error ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
