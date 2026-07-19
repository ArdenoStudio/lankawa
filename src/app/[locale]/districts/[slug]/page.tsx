import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getDistrict, getDistrictName } from "@/lib/districts";

export default async function DistrictDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("districts");
  const district = getDistrict(slug);

  if (!district) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/districts" className="text-sm text-teal-300 hover:text-teal-200">
        ← {t("back")}
      </Link>
      <div>
        <h1 className="text-3xl font-semibold text-white">
          {getDistrictName(district, locale)}
        </h1>
        <p className="mt-2 text-slate-400">{district.province} Province</p>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("population")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {district.population.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("area")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {district.areaSqKm.toLocaleString()} km²
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("province")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {district.province}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("capital")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {district.capital}
          </dd>
        </div>
      </dl>
    </div>
  );
}
