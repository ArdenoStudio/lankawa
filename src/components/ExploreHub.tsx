import { getTranslations } from "next-intl/server";
import { ArdenoStackGrid } from "@/components/ArdenoStackGrid";
import { DistrictGrid } from "@/components/DistrictCard";
import { exploreSections } from "@/components/ModuleGrid";
import { ExplorePersonaModules } from "@/components/PersonaSwitch";
import { PageHeader } from "@/components/ui/PageHeader";
import { Link } from "@/i18n/navigation";
import { NewsPulse } from "@/components/NewsPulse";
import { buildArdenoModuleCards, getLifeOverview } from "@/lib/life";
import { isViewPersona, type ViewPersona } from "@/lib/view-persona";

export async function ExploreHub({
  locale,
  view,
}: {
  locale: string;
  view?: string | null;
}) {
  const t = await getTranslations("explore");
  const overview = await getLifeOverview();
  const ardenoModules = buildArdenoModuleCards(overview);
  const initialPersona: ViewPersona | undefined = isViewPersona(view)
    ? view
    : undefined;

  return (
    <div className="space-y-12 md:space-y-16">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <ExplorePersonaModules
        sections={exploreSections}
        initialPersona={initialPersona}
      />

      <NewsPulse />

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{t("ardenoTitle")}</h2>
            <p className="mt-2 text-slate-400">{t("ardenoSubtitle")}</p>
          </div>
          <Link
            href="/ardeno"
            className="lk-btn-primary"
          >
            {t("viewArdeno")}
          </Link>
        </div>
        <ArdenoStackGrid modules={ardenoModules.slice(0, 4)} />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{t("districtsTitle")}</h2>
            <p className="mt-2 text-slate-400">{t("districtsSubtitle")}</p>
          </div>
          <Link
            href="/districts"
            className="lk-btn-primary"
          >
            {t("viewDistricts")}
          </Link>
        </div>
        <DistrictGrid locale={locale} limit={6} />
      </section>
    </div>
  );
}
