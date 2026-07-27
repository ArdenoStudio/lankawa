import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FieldCoverageMatrix } from "@/components/FieldCoverageMatrix";
import { fieldCoverageDoc } from "@/lib/api-docs-field-coverage";

export default async function FieldCoveragePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");

  return (
    <div className="space-y-8">
      <Link
        href="/developers/api-catalog"
        className="text-sm text-teal-300 hover:text-teal-200"
      >
        {t("catalogBack")}
      </Link>

      <div>
        <h1 className="text-3xl font-semibold text-white">{t("coverageTitle")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("coverageSubtitle")}</p>
        <p className="mt-3 text-sm text-slate-500">{t("coverageBanner")}</p>
      </div>

      <p className="text-sm text-slate-400">
        {t("coverageStats", {
          domains: Object.keys(fieldCoverageDoc.domains).length,
          packages: fieldCoverageDoc.package_count_in_matrix,
        })}
      </p>

      <FieldCoverageMatrix
        doc={fieldCoverageDoc}
        labels={{
          domainLabel: t("coverageDomain"),
          allDomains: t("coverageAllDomains"),
          searchPlaceholder: t("coverageSearch"),
          legendTitle: t("coverageLegend"),
          empty: t("coverageEmpty"),
          yCount: t("coverageY"),
          pCount: t("coverageP"),
        }}
      />
    </div>
  );
}
