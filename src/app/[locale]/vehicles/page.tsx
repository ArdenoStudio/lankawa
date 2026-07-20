import { getTranslations, setRequestLocale } from "next-intl/server";
import { VehicleDistrictTable } from "@/components/VehicleDistrictTable";
import { VehicleModelDeepDive } from "@/components/VehicleModelDeepDive";
import { VehiclePopularMakes } from "@/components/VehiclePopularMakes";
import { Link } from "@/i18n/navigation";
import { getSourceProvenancePath } from "@/lib/sources";
import { formatVehiclePrice, getVehicleData } from "@/lib/vehicle";

export default async function VehiclesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("vehicles");
  const snapshot = await getVehicleData();
  const colombo = snapshot.districts.find(
    (district) => district.slug === "colombo",
  );

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

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("totalListings")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {snapshot.totalListings.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("avgPrice")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            LKR {formatVehiclePrice(snapshot.avgPriceLkr)}
          </dd>
        </div>
        {colombo ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <dt className="text-sm text-slate-500">{t("colomboMedian")}</dt>
            <dd className="mt-2 text-3xl font-semibold text-white">
              LKR {formatVehiclePrice(colombo.medianPriceLkr)}
            </dd>
          </div>
        ) : null}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("goodDeals")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {snapshot.goodDealsCount.toLocaleString()}
          </dd>
        </div>
      </dl>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("popularMakesTitle")}</h2>
        <VehiclePopularMakes snapshot={snapshot} />
      </section>

      <VehicleModelDeepDive />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("tableTitle")}</h2>
        <p className="text-sm text-slate-400">{t("tableSubtitle")}</p>
        <VehicleDistrictTable locale={locale} snapshot={snapshot} />
      </section>

      <p className="text-sm text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
