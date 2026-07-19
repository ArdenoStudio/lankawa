import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { DistrictMapLazy } from "@/components/DistrictMapLazy";
import { Link } from "@/i18n/navigation";
import { DISTRICTS, getDistrict, getDistrictName } from "@/lib/districts";
import {
  getPopulationDensity,
  getProvinceDistrictCount,
  getProvincePopulationShare,
} from "@/lib/district-stats";
import {
  getDistrictWinnerPercentage,
  getElectionCandidate,
  getElectionDistrictResult,
  getCandidateColor,
} from "@/lib/elections";
import { getFloodStationsForDistrict } from "@/lib/flood-districts";

export default async function DistrictDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("districts");
  const district = getDistrict(slug);

  if (!district) {
    notFound();
  }

  const density = getPopulationDensity(district);
  const provinceCount = getProvinceDistrictCount(district.province, DISTRICTS);
  const provinceShare = getProvincePopulationShare(district, DISTRICTS);
  const electionResult = getElectionDistrictResult(slug);
  const floodStations = getFloodStationsForDistrict(slug);
  const electionWinner = electionResult
    ? getElectionCandidate(electionResult.winner)
    : undefined;
  const winnerPct = electionResult
    ? getDistrictWinnerPercentage(electionResult)
    : 0;

  return (
    <div className="space-y-8">
      <Link href="/districts" className="text-sm text-teal-300 hover:text-teal-200">
        ← {t("back")}
      </Link>

      <div>
        <h1 className="text-3xl font-semibold text-white">
          {getDistrictName(district, locale)}
        </h1>
        <p className="mt-2 text-slate-400">
          {district.province} {t("province")}
        </p>
      </div>

      <DistrictMapLazy
        locale={locale}
        highlightSlug={slug}
        height={280}
        interactive={false}
      />

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("population")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {district.population.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("area")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {district.areaSqKm.toLocaleString()} km²
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("density")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {density.toLocaleString()} /km²
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("province")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {district.province}
          </dd>
          <dd className="mt-1 text-xs text-slate-500">
            {t("provinceContext", {
              count: provinceCount,
              share: provinceShare.toFixed(1),
            })}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("capital")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {district.capital}
          </dd>
        </div>
        {electionResult && electionWinner ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <dt className="text-sm text-slate-500">{t("election2024")}</dt>
            <dd
              className="mt-2 text-lg font-semibold"
              style={{ color: getCandidateColor(electionResult.winner) }}
            >
              {electionWinner.party}
            </dd>
            <dd className="mt-1 text-xs text-slate-500">
              {winnerPct.toFixed(1)}% · {t("firstPreference")}
            </dd>
          </div>
        ) : null}
      </dl>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("relatedTitle")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {electionResult ? (
            <Link
              href={`/elections/${slug}`}
              className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
            >
              <p className="font-medium text-white">{t("relatedElections")}</p>
              <p className="mt-1 text-sm text-slate-400">
                {t("relatedElectionsDesc")}
              </p>
            </Link>
          ) : null}
          <Link
            href="/disaster"
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedDisaster")}</p>
            <p className="mt-1 text-sm text-slate-400">
              {floodStations.length > 0
                ? t("relatedDisasterStations", { count: floodStations.length })
                : t("relatedDisasterDesc")}
            </p>
          </Link>
          <Link
            href="/economy"
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedEconomy")}</p>
            <p className="mt-1 text-sm text-slate-400">{t("relatedEconomyDesc")}</p>
          </Link>
        </div>
        {floodStations.length > 0 ? (
          <p className="text-xs text-slate-500">
            {t("floodStations")}: {floodStations.join(", ")}
          </p>
        ) : null}
      </section>
    </div>
  );
}
