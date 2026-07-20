import { getTranslations } from "next-intl/server";
import type { FoodProvenance } from "@/lib/integrations/food";

function formatMarketMonthYear(isoOrDate: string, locale: string): string {
  const raw = isoOrDate.includes("T") ? isoOrDate : `${isoOrDate}T00:00:00.000Z`;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return isoOrDate.slice(0, 7);
  }
  return date.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** P30 — essentials honesty: FoodLK live / WFP / SPAR2U / Life / seed. */
export async function HartiEssentialsNote({
  provenance,
  corpusAsOf,
  locale,
}: {
  provenance: FoodProvenance;
  corpusAsOf?: string;
  locale?: string;
}) {
  if (provenance === "live") {
    return null;
  }

  const t = await getTranslations("food");

  const title =
    provenance === "wfp_hdx"
      ? t("hartiTitleWfp")
      : provenance === "spar2u"
        ? t("hartiTitleSpar")
        : t("hartiTitle");

  const body =
    provenance === "wfp_hdx"
      ? t("hartiBodyWfp")
      : provenance === "spar2u"
        ? t("hartiBodySpar")
        : provenance === "life_federation"
          ? t("hartiBodyLife")
          : t("hartiBodySeed");

  const honesty =
    provenance === "wfp_hdx"
      ? t("hartiHonestyWfp")
      : provenance === "spar2u"
        ? t("hartiHonestySpar")
        : t("hartiHonesty");

  const lagMonthYear =
    corpusAsOf && locale
      ? formatMarketMonthYear(corpusAsOf, locale)
      : corpusAsOf
        ? formatMarketMonthYear(corpusAsOf, "en")
        : null;

  return (
    <aside className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
      <p className="font-medium text-white">{title}</p>
      {lagMonthYear ? (
        <p className="mt-1 text-base font-semibold text-amber-100/95">
          {t("corpusAsOfLoud", { monthYear: lagMonthYear })}
        </p>
      ) : null}
      <p className="mt-1 text-slate-300">{body}</p>
      <p className="mt-2 text-xs text-slate-500">{honesty}</p>
    </aside>
  );
}
