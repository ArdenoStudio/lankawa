import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DistrictCard } from "@/components/DistrictCard";
import { ProvinceMapSection } from "@/components/ProvinceMapSectionLazy";
import { ProvinceSwingSummary } from "@/components/ElectionSwingChart";
import { Link } from "@/i18n/navigation";
import {
  getDistrictWinnerPercentage,
  getElectionCandidate,
  getElectionDistrictResult,
  getCandidateColor,
  getParliamentaryDistrictForAdminDistrict,
  getParliamentaryParty,
  getPartyColor,
} from "@/lib/elections";
import { buildProvinceMetadata } from "@/lib/metadata";
import {
  getDistrictsForProvince,
  getProvince,
  getProvinceArea,
  getProvinceDensity,
  getProvinceName,
  getProvincePopulation,
} from "@/lib/provinces";
import { getProvincePulse } from "@/lib/province-pulse";

export async function generateStaticParams() {
  const { PROVINCES } = await import("@/lib/provinces");
  return PROVINCES.map((province) => ({ slug: province.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  return buildProvinceMetadata(locale, slug);
}

export default async function ProvinceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("provinces");
  const province = getProvince(slug);

  if (!province) {
    notFound();
  }

  const districts = getDistrictsForProvince(province);
  const population = getProvincePopulation(districts);
  const area = getProvinceArea(districts);
  const density = getProvinceDensity(districts);
  const pulse = await getProvincePulse(districts.map((district) => district.slug));

  const presidentialWins = districts.reduce(
    (acc, district) => {
      const result = getElectionDistrictResult(district.slug);
      if (result) {
        acc[result.winner] = (acc[result.winner] ?? 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const parliamentarySeats = districts.reduce(
    (acc, district) => {
      const result = getParliamentaryDistrictForAdminDistrict(district.slug);
      if (result) {
        for (const [partyId, seats] of Object.entries(result.seats)) {
          acc[partyId] = (acc[partyId] ?? 0) + seats;
        }
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-8">
      <Link href="/provinces" className="text-sm text-teal-300 hover:text-teal-200">
        ← {t("back")}
      </Link>

      <div>
        <h1 className="text-3xl font-semibold text-white">
          {getProvinceName(province, locale)}
        </h1>
        <p className="mt-2 text-slate-400">
          {t("districtCount", { count: districts.length })}
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("population")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {population.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("area")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {area.toLocaleString()} km²
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("density")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {density.toLocaleString()} /km²
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("districts")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {districts.length}
          </dd>
        </div>
      </dl>

      <section
        aria-label={t("pulseTitle")}
        className="rounded-2xl border border-teal-400/20 bg-teal-500/[0.06] px-4 py-4 sm:px-5"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium text-teal-100">{t("pulseTitle")}</h2>
            <p className="mt-1 text-xs text-slate-400">{t("pulseSubtitle")}</p>
          </div>
        </div>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-slate-500">{t("pulseDengue")}</dt>
            <dd className="mt-1 flex items-baseline gap-2 text-xl font-semibold text-white">
              <span>{pulse.dengueCases.toLocaleString(locale)}</span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {pulse.dengueIsSeed ? t("pulseSeed") : t("pulseLive")}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">{t("pulseAqi")}</dt>
            <dd className="mt-1 flex items-baseline gap-2 text-xl font-semibold text-white">
              <span>
                {pulse.averageAqi != null
                  ? t("pulseAqiValue", {
                      value: pulse.averageAqi,
                      count: pulse.aqiDistrictCount,
                    })
                  : "—"}
              </span>
              {pulse.averageAqi != null ? (
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  {pulse.aqiIsSeed ? t("pulseSeed") : t("pulseLive")}
                </span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">{t("pulseFlood")}</dt>
            <dd className="mt-1 text-xl font-semibold text-white">
              {pulse.floodElevatedCount != null
                ? pulse.floodElevatedCount.toLocaleString(locale)
                : t("pulseFloodUnavailable")}
            </dd>
          </div>
        </dl>
      </section>

      <ProvinceMapSection
        provinceDistrictSlugs={districts.map((district) => district.slug)}
      />

      <ProvinceSwingSummary
        districtSlugs={districts.map((district) => district.slug)}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("electionSummary")}</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="font-medium text-white">{t("presidential2024")}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {Object.entries(presidentialWins).map(([candidateId, count]) => {
                const candidate = getElectionCandidate(candidateId);
                if (!candidate) {
                  return null;
                }
                return (
                  <li
                    key={candidateId}
                    className="flex items-center justify-between"
                  >
                    <span style={{ color: getCandidateColor(candidate.id) }}>
                      {candidate.party}
                    </span>
                    <span className="text-slate-400">
                      {count} {t("districtsWon")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="font-medium text-white">{t("parliamentary2024")}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {Object.entries(parliamentarySeats)
                .filter(([, seats]) => seats > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([partyId, seats]) => {
                  const party = getParliamentaryParty(partyId);
                  if (!party) {
                    return null;
                  }
                  return (
                    <li key={partyId} className="flex items-center justify-between">
                      <span style={{ color: getPartyColor(party.id) }}>
                        {party.abbreviation}
                      </span>
                      <span className="text-slate-400">
                        {seats} {t("seats")}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </article>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("districtList")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/local-government"
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedLocalGov")}</p>
            <p className="mt-1 text-sm text-slate-400">{t("relatedLocalGovDesc")}</p>
          </Link>
          <Link
            href="/property"
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedProperty")}</p>
            <p className="mt-1 text-sm text-slate-400">{t("relatedPropertyDesc")}</p>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {districts.map((district) => {
            const electionResult = getElectionDistrictResult(district.slug);
            const winner = electionResult
              ? getElectionCandidate(electionResult.winner)
              : undefined;
            const winnerPct = electionResult
              ? getDistrictWinnerPercentage(electionResult)
              : 0;

            return (
              <div key={district.slug} className="space-y-2">
                <DistrictCard district={district} locale={locale} />
                {electionResult && winner ? (
                  <p className="px-1 text-xs text-slate-500">
                    {t("presidential2024")}:{" "}
                    <span style={{ color: getCandidateColor(electionResult.winner) }}>
                      {winner.party}
                    </span>{" "}
                    · {winnerPct.toFixed(1)}%
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
