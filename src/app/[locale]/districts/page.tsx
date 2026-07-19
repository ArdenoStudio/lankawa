import { getTranslations, setRequestLocale } from "next-intl/server";
import { DistrictGrid } from "@/components/DistrictCard";
import { DistrictMapLazy } from "@/components/DistrictMapLazy";

export default async function DistrictsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("districts");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>
      <DistrictMapLazy />
      <DistrictGrid locale={locale} />
    </div>
  );
}
