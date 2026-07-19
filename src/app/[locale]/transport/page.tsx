import { getTranslations, setRequestLocale } from "next-intl/server";
import { TransportDirectory } from "@/components/TransportDirectory";
import { TransportMapLazy } from "@/components/TransportMapLazy";
import { Link } from "@/i18n/navigation";
import { getTransportCatalog } from "@/lib/transport";
import { getSourceProvenancePath } from "@/lib/sources";

export default async function TransportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ district?: string; q?: string }>;
}) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("transport");
  const catalog = getTransportCatalog();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
        <p className="mt-3 text-xs text-slate-500">
          {t("source")}:{" "}
          <Link
            href={getSourceProvenancePath(catalog.sourceId)}
            className="text-teal-300 hover:text-teal-200"
          >
            {catalog.sourceName}
          </Link>
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("mapTitle")}</h2>
        <TransportMapLazy />
      </section>

      <TransportDirectory
        initialDistrict={filters.district}
        initialQuery={filters.q}
      />

      <p className="text-sm text-slate-500">
        {t("vehiclesLink")}:{" "}
        <Link href="/vehicles" className="text-teal-300 hover:text-teal-200">
          {t("vehiclesLinkCta")} →
        </Link>
      </p>

      <p className="text-sm text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
