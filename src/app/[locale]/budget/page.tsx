import { getTranslations, setRequestLocale } from "next-intl/server";
import { BudgetBreakdown } from "@/components/BudgetBreakdown";
import { Link } from "@/i18n/navigation";
import { getBudgetSnapshot, getDefaultBudgetFiscalYear } from "@/lib/budget";
import { getSourceProvenancePath } from "@/lib/sources";

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("budget");
  const snapshot = getBudgetSnapshot();
  const fiscalYear = getDefaultBudgetFiscalYear();

  const sectorLabels = Object.fromEntries(
    fiscalYear.sectors.map((sector) => [sector.id, t(`sectors.${sector.id}`)]),
  );
  const ministryLabels = Object.fromEntries(
    fiscalYear.ministries.map((ministry) => [
      ministry.id,
      t(`ministries.${ministry.id}`),
    ]),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
        <p className="mt-2 text-sm text-slate-500">
          {fiscalYear.label} ·{" "}
          <Link
            href={getSourceProvenancePath(snapshot.sourceId)}
            className="text-teal-300 hover:text-teal-200"
          >
            {snapshot.sourceName}
          </Link>
        </p>
      </div>

      <BudgetBreakdown
        fiscalYear={fiscalYear}
        sectorLabels={sectorLabels}
        ministryLabels={ministryLabels}
      />
    </div>
  );
}
