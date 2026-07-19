import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { apiEndpoints } from "@/lib/openapi";

export default async function DevelopersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("developers");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-semibold text-white">{t("overviewTitle")}</h2>
        <p className="mt-2 text-slate-300">{t("overviewBody")}</p>
        <p className="mt-3 text-sm text-slate-400">{t("baseUrl")}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">{t("endpointsTitle")}</h2>
        {apiEndpoints.map((endpoint) => (
          <article
            key={endpoint.path}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-200">
                {endpoint.method}
              </span>
              <code className="text-sm text-white">{endpoint.path}</code>
            </div>
            <h3 className="mt-3 font-medium text-white">
              {t(endpoint.summaryKey)}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {t(endpoint.descriptionKey)}
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950/80 p-4 text-xs text-slate-300">
              {endpoint.example}
            </pre>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-semibold text-white">{t("provenanceTitle")}</h2>
        <p className="mt-2 text-slate-300">{t("provenanceBody")}</p>
        <Link
          href="/sources"
          className="mt-4 inline-block text-sm text-teal-300 hover:text-teal-200"
        >
          {t("provenanceLink")}
        </Link>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-semibold text-white">{t("openApiTitle")}</h2>
        <p className="mt-2 text-slate-300">{t("openApiBody")}</p>
        <Link
          href="/developers/openapi"
          className="mt-4 inline-block text-sm text-teal-300 hover:text-teal-200"
        >
          {t("openApiLink")}
        </Link>
      </section>
    </div>
  );
}
