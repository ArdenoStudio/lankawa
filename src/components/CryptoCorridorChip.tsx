import { getTranslations } from "next-intl/server";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import { fetchCoinGeckoBtcLkrSnapshot } from "@/lib/integrations/coingecko";
import { getSourceProvenancePath } from "@/lib/sources";

/** Optional remittance-context chip — omit entirely when CoinGecko is down. */
export async function CryptoCorridorChip({ locale }: { locale: string }) {
  const snapshot = await fetchCoinGeckoBtcLkrSnapshot();
  if (!snapshot) {
    return null;
  }

  const t = await getTranslations("economy");

  return (
    <aside className="flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-white/[0.03] px-4 py-3">
      <div>
        <p className="text-sm font-medium text-white">
          {t("cryptoCorridor.title")}
        </p>
        <p className="mt-0.5 text-xs text-neutral-400">
          {t("cryptoCorridor.subtitle")}
        </p>
        <p className="mt-2 text-lg font-semibold tabular-nums text-white">
          {t("cryptoCorridor.btcLkr")}{" "}
          {snapshot.btcLkr.toLocaleString(locale, {
            maximumFractionDigits: 0,
          })}
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          {t("cryptoCorridor.asOf", {
            date: new Date(snapshot.asOf).toLocaleString(locale),
          })}
          {" · "}
          {t("cryptoCorridor.honesty")}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <FreshnessBadge tier={snapshot.tier} />
        <Link
          href={getSourceProvenancePath(snapshot.sourceId)}
          className="text-xs text-white underline decoration-white/30 hover:decoration-white"
        >
          {t("cryptoCorridor.provenance")}
        </Link>
      </div>
    </aside>
  );
}
