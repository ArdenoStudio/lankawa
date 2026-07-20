import { getTranslations, setRequestLocale } from "next-intl/server";
import { CivicResearchStrip } from "@/components/CivicResearchStrip";
import { HansardHonestyNote } from "@/components/HansardHonestyNote";
import { MpScorecardList } from "@/components/MpScorecardList";
import { Link } from "@/i18n/navigation";
import { getMpScorecardSnapshot } from "@/lib/civic";
import { getSourceProvenancePath } from "@/lib/sources";

export default async function CivicPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("civic");
  const snapshot = getMpScorecardSnapshot();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
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

      <CivicResearchStrip locale={locale} />

      <HansardHonestyNote />

      <MpScorecardList members={snapshot.members} locale={locale} />

      <p className="text-sm text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
