import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  getMpBySlug,
  getMpName,
  getMpScorecardSnapshot,
  getAllMpSlugs,
} from "@/lib/civic";
import { getDistrict, getDistrictName } from "@/lib/districts";
import { getSourceProvenancePath } from "@/lib/sources";

export function generateStaticParams() {
  return getAllMpSlugs().map((slug) => ({ slug }));
}

export default async function CivicConstituencyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("civic");
  const snapshot = getMpScorecardSnapshot();
  const member = getMpBySlug(slug);

  if (!member) {
    notFound();
  }

  const district = getDistrict(member.electoralDistrict);

  return (
    <div className="space-y-8">
      <Link href="/civic" className="text-sm text-teal-300 hover:text-teal-200">
        ← {t("back")}
      </Link>

      <div>
        <h1 className="text-3xl font-semibold text-white">
          {getMpName(member, locale)}
        </h1>
        <p className="mt-2 text-slate-400">
          {member.party} · {district ? getDistrictName(district, locale) : member.electoralDistrict}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {snapshot.parliamentSession} ·{" "}
          <Link
            href={getSourceProvenancePath(snapshot.sourceId)}
            className="text-teal-300 hover:text-teal-200"
          >
            {snapshot.sourceName}
          </Link>
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("attendance")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {member.attendancePct}%
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("privateBills")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {member.privateMemberBills}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("questions")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {member.questionsAsked}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("committees")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {member.committeeRoles}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/elections/parliamentary/${member.electoralDistrict}`}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-teal-300 hover:bg-white/5"
        >
          {t("viewDistrict")}
        </Link>
        {district ? (
          <Link
            href={`/districts/${district.slug}`}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-teal-300 hover:bg-white/5"
          >
            {t("viewAdminDistrict")}
          </Link>
        ) : null}
      </div>

      <p className="text-sm text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
