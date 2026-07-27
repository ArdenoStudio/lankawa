import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { htmlVsApiDoc } from "@/lib/api-docs-html-vs-api";

export default async function HtmlVsApiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");
  const packages = [...htmlVsApiDoc.packages].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );
  const totals = htmlVsApiDoc.totals;
  const accessKeys = Object.keys(totals);

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
          {t("htmlVsApiTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          {t("htmlVsApiSubtitle")}
        </p>
        <p className="mt-3 text-sm text-slate-500">{t("htmlVsApiBanner")}</p>
      </div>

      <p className="text-sm text-slate-400">
        {t("htmlVsApiStats", {
          packages: packages.length,
          endpoints: Object.values(totals).reduce((a, b) => a + b, 0),
          apiLike: packages.reduce((a, p) => a + p.api_like, 0),
          htmlLike: packages.reduce((a, p) => a + p.html_like, 0),
        })}
      </p>

      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
        {accessKeys.map((key) => (
          <span key={key} className="rounded border border-white/10 px-2 py-1">
            {htmlVsApiDoc.access_labels[key] ?? key}: {totals[key]}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-950/80 text-slate-400">
            <tr>
              <th className="px-3 py-2 font-medium">
                {t("htmlVsApiColPackage")}
              </th>
              <th className="px-3 py-2 font-medium">{t("htmlVsApiColTier")}</th>
              <th className="px-3 py-2 font-medium">{t("htmlVsApiColApi")}</th>
              <th className="px-3 py-2 font-medium">{t("htmlVsApiColHtml")}</th>
              <th className="px-3 py-2 font-medium">
                {t("htmlVsApiColParked")}
              </th>
              <th className="px-3 py-2 font-medium">
                {t("htmlVsApiColDominant")}
              </th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => {
              const dominant =
                Object.entries(pkg.counts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
                "—";
              return (
                <tr key={pkg.slug} className="border-t border-white/5">
                  <td className="px-3 py-2 font-mono text-xs text-slate-200">
                    {pkg.slug}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-400">
                    {pkg.tier ?? "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-teal-200">
                    {pkg.api_like}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-amber-200/90">
                    {pkg.html_like}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">
                    {pkg.parked}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-400">
                    {dominant}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("htmlVsApiDetailTitle")}
        </h2>
        {packages.map((pkg) => (
          <details
            key={pkg.slug}
            className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
          >
            <summary className="cursor-pointer font-mono text-sm text-teal-200">
              {pkg.slug}{" "}
              <span className="text-slate-500">
                ({pkg.endpoints.length} · api {pkg.api_like} · html{" "}
                {pkg.html_like})
              </span>
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-xs">
                <thead className="text-slate-500">
                  <tr>
                    <th className="px-2 py-1 font-medium">Id</th>
                    <th className="px-2 py-1 font-medium">Access</th>
                    <th className="px-2 py-1 font-medium">Path</th>
                    <th className="px-2 py-1 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {pkg.endpoints.map((ep) => (
                    <tr key={ep.id} className="border-t border-white/5">
                      <td className="px-2 py-1 font-mono text-slate-300">
                        {ep.id}
                      </td>
                      <td className="px-2 py-1 font-mono text-teal-200/90">
                        {ep.access}
                      </td>
                      <td className="px-2 py-1 font-mono text-slate-400">
                        {ep.path || ep.url}
                      </td>
                      <td className="px-2 py-1 text-slate-500">{ep.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}
