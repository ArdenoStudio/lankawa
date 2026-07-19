import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSourceProvenancePath, SOURCES } from "@/lib/sources";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-400">{t("subtitle")}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">{t("missionTitle")}</h2>
        <p className="max-w-2xl text-slate-400">{t("missionBody")}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("sourcesTitle")}</h2>
        <ul className="space-y-3">
          {SOURCES.map((source) => (
            <li
              key={source.id}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <Link
                href={getSourceProvenancePath(source.id)}
                className="font-medium text-teal-300 hover:text-teal-200"
              >
                {source.name}
              </Link>
              <p className="mt-1 text-sm capitalize text-slate-500">
                {source.category} · {t("refreshEvery", { minutes: source.cadenceMinutes })}
              </p>
            </li>
          ))}
        </ul>
        <Link
          href="/sources"
          className="inline-block text-sm text-teal-300 hover:text-teal-200"
        >
          {t("freshnessLink")}
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">{t("freshnessTitle")}</h2>
        <p className="max-w-2xl text-slate-400">{t("freshnessBody")}</p>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-400">
          <li>{t("freshnessFresh")}</li>
          <li>{t("freshnessStale")}</li>
          <li>{t("freshnessDown")}</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">{t("disclaimerTitle")}</h2>
        <p className="max-w-2xl text-slate-400">{t("disclaimerBody")}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">{t("platformTitle")}</h2>
        <p className="max-w-2xl text-slate-400">{t("platformBody")}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">{t("apiTitle")}</h2>
        <p className="max-w-2xl text-slate-400">{t("apiBody")}</p>
        <Link
          href="/developers"
          className="inline-flex rounded-full bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-teal-400"
        >
          {t("apiLink")}
        </Link>
      </section>
    </div>
  );
}
