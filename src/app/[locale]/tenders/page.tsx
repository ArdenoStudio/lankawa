import { getTranslations, setRequestLocale } from "next-intl/server";
import { TenderFeed } from "@/components/TenderFeed";
import { Link } from "@/i18n/navigation";
import { getTendersData } from "@/lib/tenders";
import { getSourceProvenancePath } from "@/lib/sources";

export default async function TendersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ district?: string; q?: string }>;
}) {
  const { locale } = await params;
  const { district, q } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("tenders");
  const tBudget = await getTranslations("budget");
  const snapshot = await getTendersData();

  const ministryLabels = {
    finance: tBudget("ministries.finance"),
    education_min: tBudget("ministries.education_min"),
    health_min: tBudget("ministries.health_min"),
    defence_min: tBudget("ministries.defence_min"),
    highways: tBudget("ministries.highways"),
    plantation: tBudget("ministries.plantation"),
    power: tBudget("ministries.power"),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
        <p className="mt-2 text-sm text-slate-500">
          {t("asOf", { date: snapshot.asOf })} ·{" "}
          <Link
            href={getSourceProvenancePath(snapshot.sourceId)}
            className="text-teal-300 hover:text-teal-200"
          >
            {snapshot.sourceName}
          </Link>
        </p>
      </div>

      <TenderFeed
        initialDistrict={district}
        initialQuery={q}
        ministryLabels={ministryLabels}
        notices={snapshot.notices}
      />

      <p className="text-sm text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
