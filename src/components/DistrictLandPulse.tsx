import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getLandChangeForDistrict } from "@/lib/land-change";
import { getSourceProvenancePath } from "@/lib/sources";

export async function DistrictLandPulse({
  slug,
}: {
  slug: string;
}) {
  const t = await getTranslations("landChange");
  const row = getLandChangeForDistrict(slug);

  if (!row) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-2xl border border-white/15 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            {t("districtTitle")}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">{t("districtSubtitle")}</p>
        </div>
        <Link
          href="/environment"
          className="text-xs text-white underline decoration-white/30 hover:decoration-white"
        >
          {t("viewNational")}
        </Link>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <dt className="text-xs text-neutral-500">{t("greeneryDistrict")}</dt>
          <dd className="mt-1 text-2xl font-semibold text-white">
            {row.greeneryDelta > 0 ? "+" : ""}
            {row.greeneryDelta}
            <span className="ml-2 text-sm font-normal text-neutral-400">
              {t("points2018to2024")}
            </span>
          </dd>
          <p className="mt-1 text-xs text-neutral-500">
            {row.greenery2018} → {row.greenery2024}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <dt className="text-xs text-neutral-500">{t("builtUpDistrict")}</dt>
          <dd className="mt-1 text-2xl font-semibold text-white">
            {row.builtUpDelta > 0 ? "+" : ""}
            {row.builtUpDelta}
            <span className="ml-2 text-sm font-normal text-neutral-400">
              {t("points2018to2024")}
            </span>
          </dd>
          <p className="mt-1 text-xs text-neutral-500">
            {row.builtUp2018} → {row.builtUp2024}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <dt className="text-xs text-neutral-500">{t("ndviDistrict")}</dt>
          <dd className="mt-1 text-2xl font-semibold text-white">
            {row.ndviAnomaly > 0 ? "+" : ""}
            {row.ndviAnomaly.toFixed(2)}
          </dd>
          <p className="mt-1 text-xs text-neutral-500">{row.ndviWeekLabel}</p>
        </div>
      </dl>

      <p className="text-xs text-neutral-500">
        <Link
          href={getSourceProvenancePath("lankawa_land_pulse")}
          className="text-white underline decoration-white/30 hover:decoration-white"
        >
          {t("sourceLink")}
        </Link>
        {" · "}
        <Link
          href="/environment/land-change"
          className="text-white underline decoration-white/30 hover:decoration-white"
        >
          {t("methodologyLink")}
        </Link>
      </p>
    </section>
  );
}
