import { getTranslations, setRequestLocale } from "next-intl/server";
import { EnvironmentDistrictTable } from "@/components/EnvironmentDistrictTable";
import { Link } from "@/i18n/navigation";
import { getEnvironmentSnapshot } from "@/lib/environment";
import { getSourceProvenancePath } from "@/lib/sources";

export default async function EnvironmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("environment");
  const snapshot = getEnvironmentSnapshot();

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

      <EnvironmentDistrictTable locale={locale} />

      <p className="text-sm text-slate-500">
        {t("healthLink")}{" "}
        <Link href="/health" className="text-teal-300 hover:text-teal-200">
          {t("healthLinkAction")}
        </Link>
      </p>

      <p className="text-sm text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
