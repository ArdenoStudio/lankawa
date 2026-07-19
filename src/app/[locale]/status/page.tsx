import { getTranslations, setRequestLocale } from "next-intl/server";
import { StatusDashboard } from "@/components/StatusDashboard";
import { computeFreshnessTier } from "@/lib/freshness";
import {
  getAllSourceStatusFromDb,
  isDatabaseConfigured,
} from "@/lib/db";
import { buildHealthSnapshot } from "@/lib/pulse";
import { SOURCES, getSourceProvenancePath } from "@/lib/sources";
import type { FreshnessTier } from "@/lib/types";

async function buildStatusRows() {
  if (isDatabaseConfigured()) {
    try {
      const dbRows = await getAllSourceStatusFromDb();
      if (dbRows.length > 0) {
        return dbRows.map((row) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          tier: row.freshnessTier,
          lastCheckedAt: row.lastCheckedAt,
          lastSuccessAt: row.lastOk ? row.lastCheckedAt : null,
          error: row.lastError,
          provenancePath: getSourceProvenancePath(row.id),
        }));
      }
    } catch {
      // Fall through to live health snapshot
    }
  }

  const liveHealth = await buildHealthSnapshot();
  const liveById = new Map(liveHealth.map((item) => [item.id, item]));

  return SOURCES.map((source) => {
    const live = liveById.get(source.id);
    const tier: FreshnessTier =
      live?.tier ??
      computeFreshnessTier(live?.lastSuccessAt ?? null, source.cadenceMinutes);

    return {
      id: source.id,
      name: source.name,
      category: source.category,
      tier,
      lastCheckedAt: live?.lastCheckedAt ?? null,
      lastSuccessAt: live?.lastSuccessAt ?? null,
      error: live?.error ?? null,
      provenancePath: getSourceProvenancePath(source.id),
    };
  });
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("status");
  const sources = await buildStatusRows();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
        <p className="mt-2 text-sm text-slate-500">{t("disclaimer")}</p>
      </div>

      <StatusDashboard sources={sources} />
    </div>
  );
}
