import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { tsClientsDoc } from "@/lib/api-docs-ts-clients";

export default async function TsClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");
  const clients = [...tsClientsDoc.clients].sort((a, b) =>
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
        <h1 className="text-3xl font-semibold text-white">{t("tsClientsTitle")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("tsClientsSubtitle")}</p>
        <p className="mt-3 text-sm text-slate-500">{t("tsClientsBanner")}</p>
      </div>

      <p className="text-sm text-slate-400">
        {t("tsClientsStats", { count: clients.length })}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-950/80 text-slate-400">
            <tr>
              <th className="px-3 py-2 font-medium">{t("tsClientsColPackage")}</th>
              <th className="px-3 py-2 font-medium">{t("tsClientsColNpm")}</th>
              <th className="px-3 py-2 font-medium">{t("tsClientsColClass")}</th>
              <th className="px-3 py-2 font-medium">{t("tsClientsColMethods")}</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.slug} className="border-t border-white/5">
                <td className="px-3 py-2 font-mono text-xs text-slate-200">
                  {c.slug}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-slate-400">
                  {c.npm}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-teal-200">
                  {c.className}
                </td>
                <td className="px-3 py-2 text-slate-300">{c.methodCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs text-slate-300">
        {t("tsClientsExample")}
      </pre>
    </div>
  );
}
