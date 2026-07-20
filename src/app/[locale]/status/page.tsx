import { getTranslations, setRequestLocale } from "next-intl/server";
import { StatusDashboard } from "@/components/StatusDashboard";
import { buildCatalogHealthSnapshot } from "@/lib/catalog-health";
import {
  getAllSourceStatusFromDb,
  isDatabaseConfigured,
} from "@/lib/db";
import { getSourceProvenancePath } from "@/lib/sources";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function buildStatusRows() {
  if (isDatabaseConfigured()) {
    try {
      const dbRows = await getAllSourceStatusFromDb();
      if (dbRows.length > 0) {
        const unknownHeavy =
          dbRows.filter((row) => row.freshnessTier === "unknown").length >
          dbRows.length / 2;
        if (!unknownHeavy) {
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
      }
    } catch {
      // Fall through to live catalog health snapshot
    }
  }

  return buildCatalogHealthSnapshot();
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
