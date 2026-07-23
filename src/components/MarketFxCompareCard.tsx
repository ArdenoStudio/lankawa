import { getTranslations } from "next-intl/server";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import { fetchMarketFxSnapshot } from "@/lib/integrations/market-fx";
import { getSourceProvenancePath } from "@/lib/sources";

export async function MarketFxCompareCard({
  locale,
  cbslSell,
}: {
  locale: string;
  cbslSell?: number | null;
}) {
  const t = await getTranslations("economy");
  const snapshot = await fetchMarketFxSnapshot();

  if (!snapshot) {
    return (
      <section className="space-y-2 border-y border-white/10 py-5">
        <h2 className="text-lg font-semibold text-white">{t("marketFx.title")}</h2>
        <p className="text-sm text-neutral-500">{t("marketFx.unavailable")}</p>
      </section>
    );
  }

  const delta =
    typeof cbslSell === "number" && Number.isFinite(cbslSell)
      ? snapshot.usdLkr - cbslSell
      : null;

  return (
    <section className="space-y-3 border-y border-white/10 py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {t("marketFx.title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            {t("marketFx.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FreshnessBadge tier={snapshot.tier} />
          <Link
            href={getSourceProvenancePath(snapshot.sourceId)}
            className="text-sm text-white underline decoration-white/30 hover:decoration-white"
          >
            {t("marketFx.provenance")}
          </Link>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            {t("marketFx.mid")}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {snapshot.usdLkr.toLocaleString(locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            <span className="ml-1 text-sm font-normal text-neutral-400">
              LKR
            </span>
          </dd>
        </div>
        {delta != null ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">
              {t("marketFx.vsCbsl")}
            </dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
              {delta > 0 ? "+" : ""}
              {delta.toLocaleString(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </dd>
          </div>
        ) : null}
      </dl>

      <p className="text-xs text-neutral-500">
        {t("marketFx.asOf", {
          date: new Date(snapshot.asOf).toLocaleDateString(locale),
        })}
        {" · "}
        {t("marketFx.honesty")}
      </p>
    </section>
  );
}
