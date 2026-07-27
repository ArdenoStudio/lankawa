import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PaginationLab } from "@/components/PaginationLab";
import { getPaginationLabEndpoints } from "@/lib/api-docs-catalog";

export default async function PaginationLabPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ pkg?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("developers");
  const rows = getPaginationLabEndpoints();

  return (
    <div className="space-y-8">
      <Link
        href="/developers/api-catalog"
        className="text-sm text-teal-300 hover:text-teal-200"
      >
        {t("catalogBack")}
      </Link>

      <div>
        <h1 className="text-3xl font-semibold text-white">{t("labTitle")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("labSubtitle")}</p>
        <p className="mt-3 text-sm text-slate-500">{t("labBanner")}</p>
      </div>

      <PaginationLab
        rows={rows}
        initialPkg={sp.pkg}
        labels={{
          packageLabel: t("labPackage"),
          allPackages: t("labAllPackages"),
          styleLabel: t("labStyle"),
          paramsLabel: t("labParams"),
          notesLabel: t("labNotes"),
          previewLabel: t("labPreview"),
          pageLabel: t("labPage"),
          limitLabel: t("labLimit"),
          offsetLabel: t("labOffset"),
          groupLabel: t("labGroup"),
          empty: t("labEmpty"),
          recipeTitle: t("labBody"),
        }}
      />
    </div>
  );
}
