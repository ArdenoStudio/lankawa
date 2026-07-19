import { getTranslations, setRequestLocale } from "next-intl/server";
import { CompareDistrictPicker } from "@/components/CompareDistrictPicker";
import { DistrictCompareTable } from "@/components/DistrictCompareTable";
import {
  buildDistrictCompareRows,
  parseCompareDistricts,
} from "@/lib/compare";

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ districts?: string }>;
}) {
  const { locale } = await params;
  const { districts: districtsParam } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("compare");

  const slugs =
    parseCompareDistricts(districtsParam).length > 0
      ? parseCompareDistricts(districtsParam)
      : ["colombo", "kandy"];
  const rows = buildDistrictCompareRows(slugs, locale);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>

      <CompareDistrictPicker selected={slugs} locale={locale} />

      <DistrictCompareTable rows={rows} />
    </div>
  );
}
