import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { changelogDoc } from "@/lib/api-docs-changelog";

export default async function CatalogChangelogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");
  const packages = [...changelogDoc.packages].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );
  const recent = [...changelogDoc.recent_updates].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <div className="space-y-8">
      <Link
        href="/developers/api-catalog"
        className="text-sm text-teal-300 hover:text-teal-200"
      >
        {t("catalogBack")}
      </Link>

      <div>
        <h1 className="text-3xl font-semibold text-white">
          {t("catalogChangelogTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          {t("catalogChangelogSubtitle")}
        </p>
        <p className="mt-3 text-sm text-slate-500">
          {t("catalogChangelogBanner")}
        </p>
      </div>

      <p className="text-sm text-slate-400">
        {t("catalogChangelogStats", {
          count: packages.length,
          generated: changelogDoc.generated,
          updates: recent.length,
        })}
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">
          {t("catalogChangelogRecentTitle")}
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500">{t("catalogChangelogEmpty")}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">
                    {t("catalogChangelogColPackage")}
                  </th>
                  <th className="px-3 py-2 font-medium">
                    {t("catalogChangelogColDate")}
                  </th>
                  <th className="px-3 py-2 font-medium">
                    {t("catalogChangelogColEndpoints")}
                  </th>
                  <th className="px-3 py-2 font-medium">
                    {t("catalogChangelogColDiff")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr
                    key={`${row.slug}-${row.date}`}
                    className="border-t border-white/5"
                  >
                    <td className="px-3 py-2 font-mono text-xs text-slate-200">
                      {row.slug}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-400">
                      {row.date}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-teal-200">
                      {row.endpoint_count}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-400">
                      {row.bootstrap
                        ? t("catalogChangelogBootstrap")
                        : t("catalogChangelogDiff", {
                            added: row.added.length,
                            removed: row.removed.length,
                            changed: row.changed.length,
                          })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">
          {t("catalogChangelogAllTitle")}
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-slate-950/80 text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">
                  {t("catalogChangelogColPackage")}
                </th>
                <th className="px-3 py-2 font-medium">
                  {t("catalogChangelogColEndpoints")}
                </th>
                <th className="px-3 py-2 font-medium">
                  {t("catalogChangelogColFiles")}
                </th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.slug} className="border-t border-white/5">
                  <td className="px-3 py-2 font-mono text-xs text-slate-200">
                    {pkg.slug}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-teal-200">
                    {pkg.endpoint_count}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">
                    CHANGELOG.md · catalog-changelog.yml
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs text-slate-300">
        {t("catalogChangelogExample")}
      </pre>
    </div>
  );
}
