import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getDistrict, getDistrictName } from "@/lib/districts";
import { getLandChangeSnapshot } from "@/lib/land-change";
import { getSourceProvenancePath } from "@/lib/sources";

export async function LandChangePulse({ locale }: { locale: string }) {
  const t = await getTranslations("landChange");
  const snapshot = getLandChangeSnapshot();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-white">
          {t("title")}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-neutral-400">{t("subtitle")}</p>
        <p className="mt-2 text-xs text-neutral-500">
          {t("asOf", { date: snapshot.asOf })} ·{" "}
          <Link
            href={getSourceProvenancePath(snapshot.sourceId)}
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {snapshot.sourceName}
          </Link>
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-5">
          <dt className="text-sm text-neutral-500">{t("greeneryNational")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {snapshot.national.greeneryDelta > 0 ? "+" : ""}
            {snapshot.national.greeneryDelta}
            <span className="ml-2 text-base font-normal text-neutral-400">
              {t("points2018to2024")}
            </span>
          </dd>
          <p className="mt-2 text-xs text-neutral-500">
            {snapshot.national.greeneryIndex2018} →{" "}
            {snapshot.national.greeneryIndex2024}
          </p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-5">
          <dt className="text-sm text-neutral-500">{t("builtUpNational")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {snapshot.national.builtUpDelta > 0 ? "+" : ""}
            {snapshot.national.builtUpDelta}
            <span className="ml-2 text-base font-normal text-neutral-400">
              {t("points2018to2024")}
            </span>
          </dd>
          <p className="mt-2 text-xs text-neutral-500">
            {snapshot.national.builtUpIndex2018} →{" "}
            {snapshot.national.builtUpIndex2024}
          </p>
        </div>
      </dl>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/15 p-4">
          <h3 className="text-sm font-semibold text-white">
            {t("topGreeneryLoss")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {snapshot.topGreeneryLoss.map((row) => {
              const district = getDistrict(row.slug);
              return (
                <li
                  key={row.slug}
                  className="flex items-center justify-between gap-2 text-neutral-300"
                >
                  <Link
                    href={`/districts/${row.slug}`}
                    className="text-white underline decoration-white/25 hover:decoration-white"
                  >
                    {district
                      ? getDistrictName(district, locale)
                      : row.slug}
                  </Link>
                  <span className="font-medium tabular-nums">
                    {row.greeneryDelta}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/15 p-4">
          <h3 className="text-sm font-semibold text-white">
            {t("topBuiltUpGain")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {snapshot.topBuiltUpGain.map((row) => {
              const district = getDistrict(row.slug);
              return (
                <li
                  key={row.slug}
                  className="flex items-center justify-between gap-2 text-neutral-300"
                >
                  <Link
                    href={`/districts/${row.slug}`}
                    className="text-white underline decoration-white/25 hover:decoration-white"
                  >
                    {district
                      ? getDistrictName(district, locale)
                      : row.slug}
                  </Link>
                  <span className="font-medium tabular-nums">
                    +{row.builtUpDelta}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-neutral-500">
        {t("attribution")}
      </p>
    </section>
  );
}
