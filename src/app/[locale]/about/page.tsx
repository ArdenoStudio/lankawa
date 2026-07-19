import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrandTagline } from "@/components/brand/BrandTagline";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSourceProvenancePath, SOURCES } from "@/lib/sources";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const brand = await getTranslations("brand");

  return (
    <div className="space-y-10">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <section className="lk-card relative overflow-hidden p-6 md:p-8">
        <div className="relative space-y-4">
          <h2 className="font-display text-xl font-semibold text-white">
            {brand("mission")}
          </h2>
          <BrandTagline />
          <p className="max-w-2xl text-neutral-400">{brand("builtBy")}</p>
        </div>
      </section>

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
              className="lk-card px-4 py-3"
            >
              <Link
                href={getSourceProvenancePath(source.id)}
                className="font-medium text-[var(--lk-teal-bright)] hover:text-teal-200"
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
          className="inline-block text-sm text-[var(--lk-teal-bright)] hover:text-teal-200"
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
        <Link
          href="/learn"
          className="inline-block text-sm text-[var(--lk-teal-bright)] hover:text-teal-200"
        >
          {t("learnLink")}
        </Link>
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
        <Link href="/developers" className="lk-btn-primary">
          {t("apiLink")}
        </Link>
      </section>
    </div>
  );
}
