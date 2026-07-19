import { getTranslations } from "next-intl/server";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { LandChangeChart } from "@/components/LandChangeChart";
import { Link } from "@/i18n/navigation";
import { getDistrict, getDistrictName } from "@/lib/districts";
import { getLandChangeSnapshot } from "@/lib/land-change";
import { getSourceProvenancePath } from "@/lib/sources";

const LAND_CHANGE_CSV_PATH = "/api/v1/export/land-change?format=csv";

export async function LandChangePulse({ locale }: { locale: string }) {
  const t = await getTranslations("landChange");
  const snapshot = getLandChangeSnapshot();
  const sourcePath = getSourceProvenancePath(snapshot.sourceId);
  const sortedDistricts = [...snapshot.districts].sort(
    (a, b) => a.greeneryDelta - b.greeneryDelta,
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-semibold text-white">
              {t("title")}
            </h2>
            <FreshnessBadge tier="stale" />
          </div>
          <p className="mt-1 max-w-2xl text-sm text-neutral-400">
            {t("subtitle")}
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            {t("asOf", { date: snapshot.asOf })} ·{" "}
            <Link
              href={sourcePath}
              className="text-white underline decoration-white/30 hover:decoration-white"
            >
              {snapshot.sourceName}
            </Link>
            {" · "}
            <Link
              href="/environment/land-change"
              className="text-white underline decoration-white/30 hover:decoration-white"
            >
              {t("methodologyLink")}
            </Link>
            {" · "}
            <a
              href={LAND_CHANGE_CSV_PATH}
              download="lankawa-land-change.csv"
              className="text-white underline decoration-white/30 hover:decoration-white"
            >
              {t("exportCsv")}
            </a>
          </p>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
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
        <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-5">
          <dt className="text-sm text-neutral-500">{t("ndviNational")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {snapshot.national.ndviAnomaly > 0 ? "+" : ""}
            {snapshot.national.ndviAnomaly.toFixed(2)}
          </dd>
          <p className="mt-2 text-xs text-neutral-500">
            {snapshot.national.ndviWeekLabel} · {t("ndviHint")}
          </p>
        </div>
      </dl>

      <LandChangeChart
        rows={snapshot.topGreeneryLoss}
        labels={{
          title: t("chartTitle"),
          greeneryDelta: t("greeneryDeltaAxis"),
          exportHint: t("chartExportHint"),
        }}
        citation={{
          title: t("greeneryNational"),
          value: `${snapshot.national.greeneryDelta > 0 ? "+" : ""}${snapshot.national.greeneryDelta} pts (2018→2024)`,
          observedAt: snapshot.asOf,
          sourceName: snapshot.sourceName,
          sourcePath,
          permalink: `/${locale}/environment`,
        }}
      />

      <div className="grid gap-4 md:grid-cols-3">
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
                    {district ? getDistrictName(district, locale) : row.slug}
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
                    {district ? getDistrictName(district, locale) : row.slug}
                  </Link>
                  <span className="font-medium tabular-nums">
                    +{row.builtUpDelta}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/15 p-4">
          <h3 className="text-sm font-semibold text-white">
            {t("topNdviStress")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {snapshot.topNdviStress.map((row) => {
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
                    {district ? getDistrictName(district, locale) : row.slug}
                  </Link>
                  <span className="font-medium tabular-nums">
                    {row.ndviAnomaly.toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/15">
        <table className="min-w-full text-left text-sm">
          <caption className="border-b border-white/10 px-4 py-3 text-left text-sm font-semibold text-white">
            {t("tableTitle")}
          </caption>
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("colDistrict")}</th>
              <th className="px-4 py-3 font-medium">{t("colGreenery")}</th>
              <th className="px-4 py-3 font-medium">{t("colBuiltUp")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedDistricts.map((row) => {
              const district = getDistrict(row.slug);
              return (
                <tr
                  key={row.slug}
                  className="border-t border-white/10 text-neutral-300"
                >
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/districts/${row.slug}`}
                      className="text-white underline decoration-white/20 hover:decoration-white"
                    >
                      {district ? getDistrictName(district, locale) : row.slug}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums">
                    {row.greenery2018}→{row.greenery2024}{" "}
                    <span className="text-neutral-500">
                      ({row.greeneryDelta > 0 ? "+" : ""}
                      {row.greeneryDelta})
                    </span>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums">
                    {row.builtUp2018}→{row.builtUp2024}{" "}
                    <span className="text-neutral-500">
                      ({row.builtUpDelta > 0 ? "+" : ""}
                      {row.builtUpDelta})
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs leading-relaxed text-neutral-500">
        {t("attribution")}
      </p>
    </section>
  );
}
