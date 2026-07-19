import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArdenoStackGrid, LifeDomainGrid } from "@/components/ArdenoStackGrid";
import { Link } from "@/i18n/navigation";
import { buildArdenoModuleCards, getLifeOverview } from "@/lib/life";
import { getSourceProvenancePath } from "@/lib/sources";

export default async function ArdenoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ardeno");
  const overview = await getLifeOverview();
  const modules = buildArdenoModuleCards(overview);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{overview.headline}</p>
        <p className="mt-2 text-sm text-slate-500">
          {t("asOf", { date: overview.asOf })} ·{" "}
          <Link
            href={getSourceProvenancePath(overview.sourceId)}
            className="text-teal-300 hover:text-teal-200"
          >
            {overview.sourceName}
          </Link>
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">{t("modulesTitle")}</h2>
        <p className="text-sm text-slate-400">{t("modulesSubtitle")}</p>
        <ArdenoStackGrid modules={modules} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">{t("lifeTitle")}</h2>
        <p className="text-sm text-slate-400">{overview.freshnessNote}</p>
        <LifeDomainGrid domains={overview.domains} />
      </section>

      <p className="text-sm text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
