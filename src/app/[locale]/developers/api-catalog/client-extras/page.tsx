import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { clientExtrasDoc } from "@/lib/api-docs-client-extras";

export default async function ClientExtrasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");
  const packages = [...clientExtrasDoc.packages].sort((a, b) =>
    a.slug.localeCompare(b.slug),
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
          {t("clientExtrasTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          {t("clientExtrasSubtitle")}
        </p>
        <p className="mt-3 text-sm text-slate-500">{t("clientExtrasBanner")}</p>
      </div>

      <p className="text-sm text-slate-400">
        {t("clientExtrasStats", {
          count: packages.length,
          labs: packages.filter((p) => p.hasPaginationLab).length,
        })}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-950/80 text-slate-400">
            <tr>
              <th className="px-3 py-2 font-medium">
                {t("clientExtrasColPackage")}
              </th>
              <th className="px-3 py-2 font-medium">
                {t("clientExtrasColModels")}
              </th>
              <th className="px-3 py-2 font-medium">
                {t("clientExtrasColLabs")}
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
                  {pkg.models.length ? pkg.models.join(", ") : "—"}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-slate-400">
                  {pkg.labEndpoints.length
                    ? pkg.labEndpoints.join(", ")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs text-slate-300">
        {t("clientExtrasExample")}
      </pre>
    </div>
  );
}
