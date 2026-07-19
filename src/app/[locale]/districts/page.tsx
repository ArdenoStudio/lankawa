import { getTranslations, setRequestLocale } from "next-intl/server";
import { DistrictGrid } from "@/components/DistrictCard";
import { DistrictMapLazy } from "@/components/DistrictMapLazy";
import { PageHeader } from "@/components/ui/PageHeader";

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
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <DistrictMapLazy locale={locale} />
      <DistrictGrid locale={locale} />
    </div>
  );
}
