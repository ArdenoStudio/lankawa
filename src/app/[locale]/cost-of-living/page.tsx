import { getTranslations, setRequestLocale } from "next-intl/server";
import { CostOfLivingTable } from "@/components/CostOfLivingTable";
import { Link } from "@/i18n/navigation";
import { getCostOfLivingSnapshot } from "@/lib/cost-of-living";
import { getSourceProvenancePath } from "@/lib/sources";

export default async function CostOfLivingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("costOfLiving");
  const snapshot = getCostOfLivingSnapshot();

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

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("nationalIndex")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {snapshot.nationalIndex}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("fuelPrice")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            LKR {snapshot.fuelPricePetrol92}
            <span className="ml-2 text-base font-normal text-slate-400">/L</span>
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("compareCta")}</dt>
          <dd className="mt-2">
            <Link
              href="/compare?districts=colombo,kandy"
              className="text-teal-300 hover:text-teal-200"
            >
              {t("compareLink")} →
            </Link>
          </dd>
        </div>
      </dl>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("tableTitle")}</h2>
        <CostOfLivingTable locale={locale} />
      </section>

      <p className="text-sm text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
