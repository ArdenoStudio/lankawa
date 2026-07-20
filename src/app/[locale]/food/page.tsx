import { getTranslations, setRequestLocale } from "next-intl/server";
import { FoodDistrictTable } from "@/components/FoodDistrictTable";
import { FoodStapleGrid } from "@/components/FoodStapleGrid";
import { HartiEssentialsNote } from "@/components/HartiEssentialsNote";
import { Link } from "@/i18n/navigation";
import { getSourceProvenancePath } from "@/lib/sources";
import { getFoodData } from "@/lib/food";

export default async function FoodPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("food");
  const snapshot = await getFoodData();
  const provenance = snapshot.provenance ?? "seed";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
        <p className="mt-2 text-sm text-slate-500">
          {t("asOf", { date: snapshot.asOf })} ·{" "}
          <Link
            href={getSourceProvenancePath(snapshot.sourceId)}
            className="text-teal-300 hover:text-teal-200"
          >
            {snapshot.sourceName}
          </Link>
          {" · "}
          {provenance === "live"
            ? t("provenanceLive")
            : provenance === "wfp_hdx"
              ? t("provenanceWfp")
              : provenance === "spar2u"
                ? t("provenanceSpar")
                : provenance === "life_federation"
                  ? t("provenanceLife")
                  : t("provenanceSeed")}
        </p>
        {provenance === "life_federation" ? (
          <p className="mt-3 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
            {t("bannerLife")}
          </p>
        ) : null}
        {provenance === "wfp_hdx" ? (
          <p className="mt-3 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
            {t("bannerWfp")}
          </p>
        ) : null}
        {provenance === "spar2u" ? (
          <p className="mt-3 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
            {t("bannerSpar")}
          </p>
        ) : null}
      </div>

      <HartiEssentialsNote provenance={provenance} />

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("essentialsBasket")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            LKR {snapshot.essentialsBasketLkr.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("retailOffers")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {snapshot.retailOffers.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("costOfLivingLink")}</dt>
          <dd className="mt-2">
            <Link
              href="/cost-of-living"
              className="text-teal-300 hover:text-teal-200"
            >
              {t("costOfLivingCta")} →
            </Link>
          </dd>
        </div>
      </dl>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("staplesTitle")}</h2>
        <FoodStapleGrid snapshot={snapshot} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("tableTitle")}</h2>
        <p className="text-sm text-slate-400">{t("tableSubtitle")}</p>
        <FoodDistrictTable locale={locale} snapshot={snapshot} />
      </section>

      <p className="text-sm text-slate-500">
        {provenance === "seed"
          ? t("disclaimerSeed")
          : provenance === "life_federation"
            ? t("disclaimerLife")
            : provenance === "wfp_hdx"
              ? t("disclaimerWfp")
              : provenance === "spar2u"
                ? t("disclaimerSpar")
                : t("disclaimer")}
      </p>
    </div>
  );
}
