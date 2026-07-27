import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pyClientsDoc } from "@/lib/api-docs-py-clients";

export default async function PyClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");
  const clients = [...pyClientsDoc.clients].sort((a, b) =>
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
        <h1 className="text-3xl font-semibold text-white">{t("pyClientsTitle")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("pyClientsSubtitle")}</p>
        <p className="mt-3 text-sm text-slate-500">{t("pyClientsBanner")}</p>
      </div>

      <p className="text-sm text-slate-400">
        {t("pyClientsStats", { count: clients.length })}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-950/80 text-slate-400">
            <tr>
              <th className="px-3 py-2 font-medium">{t("pyClientsColPackage")}</th>
              <th className="px-3 py-2 font-medium">{t("pyClientsColPip")}</th>
              <th className="px-3 py-2 font-medium">{t("pyClientsColModule")}</th>
              <th className="px-3 py-2 font-medium">{t("pyClientsColClass")}</th>
              <th className="px-3 py-2 font-medium">{t("pyClientsColMethods")}</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.slug} className="border-t border-white/5">
                <td className="px-3 py-2 font-mono text-xs text-slate-200">
                  {c.slug}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-slate-400">
                  {c.pip}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-slate-300">
                  {c.module}
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
        {t("pyClientsExample")}
      </pre>
    </div>
  );
}
