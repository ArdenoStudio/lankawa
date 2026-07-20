import { getTranslations, setRequestLocale } from "next-intl/server";
import { CoconutIndexSpark } from "@/components/CoconutIndexSpark";
import { ColBasketMovers } from "@/components/ColBasketMovers";
import { ColDistrictChoropleth } from "@/components/ColDistrictChoropleth";
import { CostOfLivingTable } from "@/components/CostOfLivingTable";
import { SupermarketCardDays } from "@/components/SupermarketCardDays";
import { Link } from "@/i18n/navigation";
import { getColBasketMovers } from "@/lib/col-movers";
import { getCostOfLivingData } from "@/lib/cost-of-living";
import { getSourceProvenancePath } from "@/lib/sources";

export default async function CostOfLivingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("costOfLiving");
  const snapshot = await getCostOfLivingData();
  const basketMovers = await getColBasketMovers();
  const isComposite = snapshot.sourceId === "cost_of_living_composite";
  const honestyValueLabels = {
    live: t("honestyValueLive"),
    seed: t("honestyValueSeed"),
    life_federation: t("honestyValueLifeFederation"),
    wfp_hdx: t("honestyValueWfp"),
    spar2u: t("honestyValueSpar"),
  };
  const honestyItems = snapshot.inputHonesty
    ? [
        {
          key: "fuel",
          label: t("honestyFuel"),
          value: snapshot.inputHonesty.fuel,
        },
        {
          key: "property",
          label: t("honestyProperty"),
          value: snapshot.inputHonesty.property,
        },
        {
          key: "food",
          label: t("honestyFood"),
          value: snapshot.inputHonesty.food,
        },
        {
          key: "coconut",
          label: t("honestyCoconut"),
          value: snapshot.inputHonesty.coconut,
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">
          {t("title")}
        </h1>
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
          <Link
            href="/cost-of-living/methodology"
            className="text-teal-300 hover:text-teal-200"
          >
            {t("methodologyLink")}
          </Link>
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        {snapshot.coconut ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <dt className="text-sm text-slate-500">{t("coconutIndex")}</dt>
            <dd className="mt-2 text-3xl font-semibold text-white">
              LKR {snapshot.coconut.priceLkr.toLocaleString()}
              <span className="ml-2 text-base font-normal text-slate-400">
                /{snapshot.coconut.unit}
              </span>
            </dd>
            <dd className="mt-2 text-xs text-slate-500">
              {snapshot.coconut.provenance}
            </dd>
          </div>
        ) : null}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2 lg:col-span-1">
          <dt className="text-sm text-slate-500">{t("foodLink")}</dt>
          <dd className="mt-2">
            <Link href="/food" className="text-teal-300 hover:text-teal-200">
              {t("foodLinkCta")} →
            </Link>
          </dd>
        </div>
      </dl>

      {honestyItems.length > 0 ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            {t("honestyTitle")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {honestyItems.map((item) => (
              <span
                key={item.key}
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300"
              >
                <span className="text-slate-500">{item.label}</span>{" "}
                <span className="font-medium text-white">
                  {honestyValueLabels[item.value]}
                </span>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <SupermarketCardDays />

      <CoconutIndexSpark
        labels={{
          title: t("coconutSpark.title"),
          subtitle: t("coconutSpark.subtitle"),
          seed: t("coconutSpark.seed"),
          delta: t("coconutSpark.delta"),
          honesty: t("coconutSpark.honesty"),
          empty: t("coconutSpark.empty"),
        }}
      />

      <ColBasketMovers
        movers={basketMovers}
        labels={{
          title: t("movers.title"),
          subtitle: t("movers.subtitle"),
          empty: t("movers.empty"),
          fuel: t("movers.fuel"),
          food: t("movers.food"),
          honestyLive: t("movers.honestyLive"),
          honestySeed: t("movers.honestySeed"),
        }}
      />

      <ColDistrictChoropleth snapshot={snapshot} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("tableTitle")}</h2>
        <CostOfLivingTable locale={locale} snapshot={snapshot} />
      </section>

      <p className="text-sm text-slate-500">
        {isComposite ? t("disclaimerLive") : t("disclaimer")}
      </p>
    </div>
  );
}
