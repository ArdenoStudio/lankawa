import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ApiCatalogExplorer } from "@/components/ApiCatalogExplorer";
import { apiDocsCatalog } from "@/lib/api-docs-catalog";

export default async function ApiCatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");

  return (
    <div className="space-y-8">
      <Link href="/developers" className="text-sm text-teal-300 hover:text-teal-200">
        {t("back")}
      </Link>

      <div>
        <h1 className="text-3xl font-semibold text-white">{t("catalogTitle")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("catalogSubtitle")}</p>
        <p className="mt-3 text-sm text-slate-500">{t("catalogBanner")}</p>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link
          href="/developers/api-catalog/pagination-lab"
          className="text-teal-300 hover:text-teal-200"
        >
          {t("catalogLabLink")}
        </Link>
        <Link
          href="/developers/api-catalog/field-coverage"
          className="text-teal-300 hover:text-teal-200"
        >
          {t("coverageNavLink")}
        </Link>
        <Link
          href="/developers/api-catalog/ts-clients"
          className="text-teal-300 hover:text-teal-200"
        >
          {t("tsClientsNavLink")}
        </Link>
        <Link
          href="/developers/api-catalog/py-clients"
          className="text-teal-300 hover:text-teal-200"
        >
          {t("pyClientsNavLink")}
        </Link>
        <Link
          href="/developers/api-catalog/client-extras"
          className="text-teal-300 hover:text-teal-200"
        >
          {t("clientExtrasNavLink")}
        </Link>
        <a
          href="https://github.com/ArdenoStudio/lankawa/tree/main/api-docs"
          className="text-teal-300 hover:text-teal-200"
          target="_blank"
          rel="noreferrer"
        >
          {t("catalogRepoLink")}
        </a>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-semibold text-white">{t("catalogStatsTitle")}</h2>
        <p className="mt-2 text-slate-300">
          {t("catalogStatsBody", {
            count: apiDocsCatalog.package_count,
            tierA: apiDocsCatalog.packages.filter((p) => p.tier === "A").length,
            tierB: apiDocsCatalog.packages.filter((p) => p.tier === "B").length,
            lab: apiDocsCatalog.packages.filter((p) => p.pagination_lab.length > 0)
              .length,
          })}
        </p>
      </section>

      <ApiCatalogExplorer
        catalog={apiDocsCatalog}
        labels={{
          searchPlaceholder: t("catalogSearch"),
          tierAll: t("catalogTierAll"),
          categoryAll: t("catalogCategoryAll"),
          tierLabel: t("catalogTier"),
          categoryLabel: t("catalogCategory"),
          endpoints: t("catalogEndpoints"),
          paginationLab: t("catalogHasLab"),
          extractTo: t("catalogExtractTo"),
          empty: t("catalogEmpty"),
          openLab: t("catalogOpenLab"),
        }}
      />
    </div>
  );
}
