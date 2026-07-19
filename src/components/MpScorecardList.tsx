"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getDistrict, getDistrictName } from "@/lib/districts";
import type { MpScorecardMember } from "@/lib/types";

export function MpScorecardList({
  members,
  locale,
}: {
  members: MpScorecardMember[];
  locale: string;
}) {
  const t = useTranslations("civic");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {members.map((member) => {
        const district = getDistrict(member.electoralDistrict);
        const districtLabel = district
          ? getDistrictName(district, locale)
          : member.electoralDistrict;

        return (
          <article
            key={member.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-white">
                  {t("memberLabel", { district: districtLabel })}
                </h3>
                <p className="mt-1 text-sm text-slate-400">{member.party}</p>
              </div>
              <Link
                href={`/elections/parliamentary/${member.electoralDistrict}`}
                className="text-xs text-teal-300 hover:text-teal-200"
              >
                {t("viewDistrict")}
              </Link>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">{t("attendance")}</dt>
                <dd className="mt-1 text-lg font-semibold text-white">
                  {member.attendancePct}%
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">{t("privateBills")}</dt>
                <dd className="mt-1 text-lg font-semibold text-white">
                  {member.privateMemberBills}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">{t("questions")}</dt>
                <dd className="mt-1 text-lg font-semibold text-white">
                  {member.questionsAsked}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">{t("committees")}</dt>
                <dd className="mt-1 text-lg font-semibold text-white">
                  {member.committeeRoles}
                </dd>
              </div>
            </dl>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-teal-500/70"
                style={{ width: `${member.attendancePct}%` }}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}
