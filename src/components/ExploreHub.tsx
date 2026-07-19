import { getTranslations } from "next-intl/server";
import { ArdenoStackGrid } from "@/components/ArdenoStackGrid";
import { DistrictGrid } from "@/components/DistrictCard";
import { exploreSections, ModuleGrid } from "@/components/ModuleGrid";
import { Link } from "@/i18n/navigation";
import { buildArdenoModuleCards, getLifeOverview } from "@/lib/life";

export async function ExploreHub({ locale }: { locale: string }) {
  const t = await getTranslations("explore");
  const overview = await getLifeOverview();
  const ardenoModules = buildArdenoModuleCards(overview);

  return (
    <div className="space-y-12 md:space-y-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>

      <ModuleGrid sections={exploreSections} />

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{t("ardenoTitle")}</h2>
            <p className="mt-2 text-slate-400">{t("ardenoSubtitle")}</p>
          </div>
          <Link
            href="/ardeno"
            className="rounded-full bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-teal-400"
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
            className="rounded-full bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-teal-400"
          >
            {t("viewDistricts")}
          </Link>
        </div>
        <DistrictGrid locale={locale} limit={6} />
      </section>
    </div>
  );
}
