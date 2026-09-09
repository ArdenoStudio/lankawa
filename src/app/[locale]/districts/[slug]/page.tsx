import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CensusFootnote } from "@/components/CensusFootnote";
import { CensusLivingConditionsCard } from "@/components/CensusLivingConditionsCard";
import { DistrictLandPulse } from "@/components/DistrictLandPulse";
import { DistrictMapLazy } from "@/components/DistrictMapLazy";
import { DistrictPinButton } from "@/components/DistrictPinButton";
import { DistrictPressStrip } from "@/components/DistrictPressStrip";
import { ElectionSwingChart } from "@/components/ElectionSwingChart";
import { FloodSparklinePanel } from "@/components/FloodSparklinePanel";
import { FloodStationList } from "@/components/FloodStationList";
import { MarineSwellCard } from "@/components/MarineSwellCard";
import { ShareDistrictCard } from "@/components/ShareDistrictCard";
import { VanniCrosswalkNotice } from "@/components/VanniCrosswalkNotice";
import { Link } from "@/i18n/navigation";
import { DISTRICTS, getDistrict, getDistrictName } from "@/lib/districts";
import {
  fetchMarineSwell,
  isCoastalDistrict,
} from "@/lib/integrations/marine";
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
  getParliamentaryDistrictForAdminDistrict,
  getParliamentaryParty,
  getPartyColor,
} from "@/lib/elections";
import { getFloodStationsForDistrict } from "@/lib/flood-districts";
import { fetchFloodLevelsForDistrict } from "@/lib/integrations/flood";
import { getLandChangeForDistrict } from "@/lib/land-change";
import { buildDistrictMetadata } from "@/lib/metadata";
import {
  getProvinceForDistrict,
  getProvinceName,
  getProvinceSlugFromDistrictProvince,
} from "@/lib/provinces";
import { getDengueDistrictStats } from "@/lib/health";
import { getPublicServicesForDistrict } from "@/lib/services";
import { getMpByElectoralDistrict } from "@/lib/civic";
import { isVanniAdminDistrict } from "@/lib/election-swing";
import {
  getDistrictCities,
  SEED_FALLBACK_DISCLAIMER,
} from "@/lib/integrations/slcities";
import { getSourceProvenancePath } from "@/lib/sources";

export async function generateStaticParams() {
  return DISTRICTS.map((district) => ({ slug: district.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  return buildDistrictMetadata(locale, slug);
}

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
  const parliamentaryResult = getParliamentaryDistrictForAdminDistrict(slug);
  const floodStationNames = getFloodStationsForDistrict(slug);
  const province = getProvinceForDistrict(district);
  const services = getPublicServicesForDistrict(slug);
  const dengueStats = getDengueDistrictStats(slug);
  const parliamentaryElectoral = getParliamentaryDistrictForAdminDistrict(slug);
  const mpMembers = parliamentaryElectoral
    ? getMpByElectoralDistrict(parliamentaryElectoral.slug)
    : getMpByElectoralDistrict(slug);

  let liveFloodStations: Awaited<ReturnType<typeof fetchFloodLevelsForDistrict>> = [];
  try {
    liveFloodStations = await fetchFloodLevelsForDistrict(slug);
  } catch {
    liveFloodStations = [];
  }

  const marineSwell = isCoastalDistrict(slug)
    ? await fetchMarineSwell(slug)
    : null;

  const locationData = await getDistrictCities(slug);

  const electionWinner = electionResult
    ? getElectionCandidate(electionResult.winner)
    : undefined;
  const winnerPct = electionResult
    ? getDistrictWinnerPercentage(electionResult)
    : 0;
  const parliamentaryWinner = parliamentaryResult
    ? getParliamentaryParty(parliamentaryResult.winner)
    : undefined;
  const landChange = getLandChangeForDistrict(slug);
  const districtName = getDistrictName(district, locale);
  const elevatedFloodCount = liveFloodStations.filter((station) => {
    const status = (station.alertStatus ?? "").toUpperCase();
    return status !== "" && status !== "NORMAL" && status !== "UNKNOWN";
  }).length;
  const shareUrl = `https://lankawa.vercel.app/${locale}/districts/${slug}`;
  const shareMetrics = [
    {
      id: "population",
      label: t("population"),
      value: district.population.toLocaleString(locale),
    },
    {
      id: "flood",
      label: t("liveFloodTitle"),
      value:
        liveFloodStations.length === 0
          ? t("liveFloodNone")
          : t("shareFloodSummary", {
              elevated: elevatedFloodCount,
              total: liveFloodStations.length,
            }),
    },
    ...(landChange
      ? [
          {
            id: "land",
            label: t("shareLandLabel"),
            value: t("shareLandValue", {
              greenery: `${landChange.greeneryDelta > 0 ? "+" : ""}${landChange.greeneryDelta}`,
              built: `${landChange.builtUpDelta > 0 ? "+" : ""}${landChange.builtUpDelta}`,
            }),
          },
        ]
      : []),
    ...(electionResult && electionWinner
      ? [
          {
            id: "election",
            label: t("election2024"),
            value: `${electionWinner.party} · ${winnerPct.toFixed(1)}%`,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/districts" className="text-sm text-teal-300 hover:text-teal-200">
          ← {t("back")}
        </Link>
        <DistrictPinButton slug={district.slug} />
      </div>

      <div>
        <h1 className="font-display text-3xl font-semibold text-white">
          {districtName}
        </h1>
        {province ? (
          <p className="mt-2 text-slate-400">
            <Link
              href={`/provinces/${province.slug}`}
              className="text-teal-300 hover:text-teal-200"
            >
              {getProvinceName(province, locale)}
            </Link>{" "}
            {t("province")}
          </p>
        ) : (
          <p className="mt-2 text-slate-400">
            {district.province} {t("province")}
          </p>
        )}
      </div>

      <CensusFootnote
        slug={slug}
        locale={locale}
        labels={{
          title: t("census.title"),
          population: t("census.population"),
          seed: t("census.seed"),
          honesty: t("census.honesty"),
          source: t("census.source"),
        }}
      />

      <CensusLivingConditionsCard
        slug={slug}
        locale={locale}
        labels={{
          title: t("census.livingTitle"),
          cleanCooking: t("census.livingCleanCooking"),
          pipeBorneWater: t("census.livingPipeBorneWater"),
          improvedSanitation: t("census.livingImprovedSanitation"),
          gridElectricity: t("census.livingGridElectricity"),
          households: t.raw("census.livingHouseholds"),
          honesty: t("census.livingHonesty"),
          source: t("census.source"),
        }}
      />

      <ShareDistrictCard
        districtName={districtName}
        url={shareUrl}
        metrics={shareMetrics}
      />

      <DistrictPressStrip district={district} locale={locale} />

      {marineSwell ? (
        <MarineSwellCard
          snapshot={marineSwell}
          labels={{
            title: t("marine.title"),
            subtitle: t("marine.subtitle"),
            seed: t("marine.seed"),
            waveHeight: t("marine.waveHeight"),
            wavePeriod: t("marine.wavePeriod"),
            waveDirection: t("marine.waveDirection"),
            honesty: t("marine.honesty"),
            asOf: t("marine.asOf", {
              time: new Date(marineSwell.asOf).toLocaleString(locale),
            }),
          }}
        />
      ) : null}

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
            {province ? (
              <Link
                href={`/provinces/${getProvinceSlugFromDistrictProvince(district.province)}`}
                className="hover:text-teal-200"
              >
                {getProvinceName(province, locale)}
              </Link>
            ) : (
              district.province
            )}
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
        {parliamentaryResult && parliamentaryWinner ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <dt className="text-sm text-slate-500">{t("parliamentary2024")}</dt>
            <dd
              className="mt-2 text-lg font-semibold"
              style={{ color: getPartyColor(parliamentaryWinner.id) }}
            >
              {parliamentaryWinner.abbreviation}
            </dd>
            <dd className="mt-1 text-xs text-slate-500">
              {parliamentaryResult.seats[parliamentaryResult.winner]}/
              {parliamentaryResult.totalSeats} {t("seats")}
            </dd>
          </div>
        ) : null}
      </dl>

      {/* Location & Postal Code Hierarchy */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {districtName} City & Postal Hierarchy
            </h2>
            <p className="text-sm text-slate-400">
              Major urban centers, 5-digit postal codes, and regional coordinates for {districtName}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/cities/nearby?district=${slug}`}
              className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition"
            >
              Proximity Search & Nearby Cities →
            </Link>
            <Link
              href={getSourceProvenancePath(locationData.sourceId)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white"
            >
              Source: {locationData.sourceId}
            </Link>
          </div>
        </div>

        {locationData.isFallback && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold">{SEED_FALLBACK_DISCLAIMER}</span>
          </div>
        )}

        {locationData.cities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
            {locationData.cities.map((city) => (
              <div
                key={`${city.slug}-${city.postcode}`}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3"
              >
                <div>
                  <span className="block text-sm font-medium text-white">{city.name}</span>
                  <span className="block text-xs font-mono text-slate-500">
                    {city.latitude.toFixed(3)}°N, {city.longitude.toFixed(3)}°E
                  </span>
                </div>
                <Link
                  href={`/cities/nearby?postal=${city.postcode}`}
                  className="rounded-md bg-teal-950/80 px-2.5 py-1 text-xs font-mono font-semibold text-teal-300 border border-teal-800/60 hover:bg-teal-900"
                >
                  {city.postcode}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No urban centers registered for this district.</p>
        )}
      </section>

      <FloodStationList
        stations={liveFloodStations}
        title={t("liveFloodTitle")}
        emptyMessage={
          floodStationNames.length > 0
            ? t("liveFloodUnavailable")
            : t("liveFloodNone")
        }
      />

      <FloodSparklinePanel stationNames={floodStationNames} />

      <DistrictLandPulse slug={slug} />

      {electionResult ? <ElectionSwingChart slug={slug} /> : null}

      {isVanniAdminDistrict(slug) ? (
        <VanniCrosswalkNotice districtSlug={slug} />
      ) : null}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("relatedTitle")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {province ? (
            <Link
              href={`/provinces/${province.slug}`}
              className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
            >
              <p className="font-medium text-white">{t("relatedProvince")}</p>
              <p className="mt-1 text-sm text-slate-400">
                {t("relatedProvinceDesc")}
              </p>
            </Link>
          ) : null}
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
          {parliamentaryResult ? (
            <Link
              href={`/elections/parliamentary/${parliamentaryResult.slug}`}
              className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
            >
              <p className="font-medium text-white">{t("relatedParliamentary")}</p>
              <p className="mt-1 text-sm text-slate-400">
                {t("relatedParliamentaryDesc")}
              </p>
            </Link>
          ) : null}
          <Link
            href="/disaster"
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedDisaster")}</p>
            <p className="mt-1 text-sm text-slate-400">
              {floodStationNames.length > 0
                ? t("relatedDisasterStations", { count: floodStationNames.length })
                : t("relatedDisasterDesc")}
            </p>
          </Link>
          <Link
            href={`/services?district=${slug}`}
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedServices")}</p>
            <p className="mt-1 text-sm text-slate-400">
              {services.length > 0
                ? t("relatedServicesCount", { count: services.length })
                : t("relatedServicesDesc")}
            </p>
          </Link>
          <Link
            href="/economy"
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedEconomy")}</p>
            <p className="mt-1 text-sm text-slate-400">{t("relatedEconomyDesc")}</p>
          </Link>
          <Link
            href="/health"
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedHealth")}</p>
            <p className="mt-1 text-sm text-slate-400">
              {dengueStats
                ? t("relatedHealthCases", { count: dengueStats.cases })
                : t("relatedHealthDesc")}
            </p>
          </Link>
          <Link
            href={`/compare?districts=${slug},colombo`}
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedCompare")}</p>
            <p className="mt-1 text-sm text-slate-400">{t("relatedCompareDesc")}</p>
          </Link>
          <Link
            href="/property"
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedProperty")}</p>
            <p className="mt-1 text-sm text-slate-400">{t("relatedPropertyDesc")}</p>
          </Link>
          <Link
            href={`/local-government?district=${slug}`}
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedLocalGov")}</p>
            <p className="mt-1 text-sm text-slate-400">{t("relatedLocalGovDesc")}</p>
          </Link>
          <Link
            href={`/transport?district=${slug}`}
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedTransport")}</p>
            <p className="mt-1 text-sm text-slate-400">{t("relatedTransportDesc")}</p>
          </Link>
          <Link
            href={`/cost-of-living`}
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedCostOfLiving")}</p>
            <p className="mt-1 text-sm text-slate-400">{t("relatedCostOfLivingDesc")}</p>
          </Link>
          {mpMembers.length > 0 ? (
            <Link
              href={`/civic/${mpMembers[0].slug}`}
              className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
            >
              <p className="font-medium text-white">{t("relatedCivic")}</p>
              <p className="mt-1 text-sm text-slate-400">{t("relatedCivicDesc")}</p>
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
