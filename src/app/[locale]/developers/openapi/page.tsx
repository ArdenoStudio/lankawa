import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { openApiSpec } from "@/lib/openapi";

export default async function OpenApiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");

  return (
    <div className="space-y-6">
      <Link href="/developers" className="text-sm text-teal-300 hover:text-teal-200">
        {t("back")}
      </Link>

      <div>
        <h1 className="text-3xl font-semibold text-white">{t("openApiTitle")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("openApiViewerSubtitle")}</p>
      </div>

      <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-5 text-xs leading-relaxed text-slate-300">
        {JSON.stringify(openApiSpec, null, 2)}
      </pre>
    </div>
  );
}
