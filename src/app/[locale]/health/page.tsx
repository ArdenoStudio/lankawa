import { getTranslations, setRequestLocale } from "next-intl/server";
import { HealthViewToggle } from "@/components/DengueChoroplethMap";
import { MohNoticesStrip } from "@/components/MohNoticesStrip";
import { UrbanHeatNote } from "@/components/UrbanHeatNote";
import { Link } from "@/i18n/navigation";
import { getDistrict, getDistrictName } from "@/lib/districts";
import { getDengueData } from "@/lib/health";
import { getSourceProvenancePath } from "@/lib/sources";

/** Matches `DENGUE_SPIKE_PCT` in alert-context for pin + page honesty. */
const DENGUE_SPIKE_PCT = 20;

export default async function HealthPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("health");
  const snapshot = await getDengueData();

  const nationalSpike = Math.abs(snapshot.nationalChangePct) >= DENGUE_SPIKE_PCT;
  const districtSpikes = snapshot.districts
    .filter((district) => Math.abs(district.changePct) >= DENGUE_SPIKE_PCT)
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
  const topDistrictSpike = districtSpikes[0];
  const showSpikeNote = nationalSpike || Boolean(topDistrictSpike);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
        <p className="mt-2 text-sm text-slate-500">
          {t("weekLabel", {
            week: snapshot.epidemiologicalWeek,
            year: snapshot.year,
          })}{" "}
          ·{" "}
          <Link
            href={getSourceProvenancePath(snapshot.sourceId)}
            className="text-teal-300 hover:text-teal-200"
          >
            {snapshot.sourceName}
          </Link>
        </p>
      </div>

      <MohNoticesStrip />

      <UrbanHeatNote />

      {showSpikeNote ? (
        <aside className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
          <p className="font-medium text-white">{t("spikeTitle")}</p>
          {nationalSpike ? (
            <p className="mt-1 text-slate-300">
              {t("spikeNational", {
                pct: `${snapshot.nationalChangePct >= 0 ? "+" : ""}${snapshot.nationalChangePct.toFixed(1)}`,
              })}
            </p>
          ) : null}
          {topDistrictSpike ? (
            <p className="mt-1 text-slate-300">
              {t("spikeDistrict", {
                district: (() => {
                  const district = getDistrict(topDistrictSpike.slug);
                  return district
                    ? getDistrictName(district, locale)
                    : topDistrictSpike.slug;
                })(),
                pct: `${topDistrictSpike.changePct >= 0 ? "+" : ""}${topDistrictSpike.changePct.toFixed(1)}`,
                count: districtSpikes.length,
              })}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-slate-500">{t("spikeHonesty")}</p>
        </aside>
      ) : null}

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("nationalCases")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {snapshot.nationalTotal.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("nationalChange")}</dt>
          <dd
            className={`mt-2 text-3xl font-semibold ${
              snapshot.nationalChangePct >= 0 ? "text-rose-300" : "text-teal-300"
            }`}
          >
            {snapshot.nationalChangePct >= 0 ? "+" : ""}
            {snapshot.nationalChangePct.toFixed(1)}%
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("reportDate")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">{snapshot.asOf}</dd>
        </div>
      </dl>

      <HealthViewToggle districts={snapshot.districts} locale={locale} />

      <p className="text-sm text-slate-500">
        {t("environmentLink")}{" "}
        <Link href="/environment" className="text-teal-300 hover:text-teal-200">
          {t("environmentLinkAction")}
        </Link>
      </p>

      <p className="text-sm text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
