import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  formatCompactOfferLine,
  getTodaysCardOffers,
  rankTopCardOffers,
} from "@/lib/integrations/card-offers";
import { getSourceProvenancePath } from "@/lib/sources";

export type SupermarketCardDaysProps = {
  /**
   * Thin 1–3 bullet strip (food / cost-of-living).
   * Ignored when `limit` > 3 (fuller economy list).
   */
  compact?: boolean;
  /** Max ranked offers. Default 3 in compact mode; omit for all in full mode. */
  limit?: number;
};

export async function SupermarketCardDays({
  compact = true,
  limit,
}: SupermarketCardDaysProps = {}) {
  const t = await getTranslations("cardOffers");
  const snapshot = await getTodaysCardOffers();
  const liveCount = snapshot.offers.filter((offer) => !offer.isSeed).length;
  const seedCount = snapshot.offers.filter((offer) => offer.isSeed).length;
  const statusLabel =
    liveCount > 0 && seedCount > 0
      ? t("mixed")
      : snapshot.isSeed || liveCount === 0
        ? t("seed")
        : t("live");

  const effectiveLimit = limit ?? (compact ? 3 : undefined);
  const showCompact = compact && (effectiveLimit == null || effectiveLimit <= 3);
  const shownOffers =
    effectiveLimit != null
      ? rankTopCardOffers(snapshot.offers, effectiveLimit)
      : snapshot.offers;

  const heading = showCompact ? t("compactTitle") : t("title");
  /** Compact strip → fuller economy list (`limit={8}` + `compact={false}`). */
  const seeAllHref = "/economy#card-days";

  return (
    <section
      id="card-days"
      className={
        showCompact
          ? "lk-motion-fade-up scroll-mt-24 space-y-2 border border-white/15 bg-black px-3 py-3 sm:px-4"
          : "lk-motion-fade-up scroll-mt-24 space-y-4 border border-white/15 bg-black px-4 py-5 sm:px-5"
      }
      aria-labelledby="supermarket-card-days-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <h2
            id="supermarket-card-days-heading"
            className={
              showCompact
                ? "lk-motion-underline text-sm font-semibold tracking-tight text-white"
                : "lk-motion-underline text-xl font-semibold tracking-tight text-white"
            }
          >
            {heading}
          </h2>
          {showCompact ? (
            <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">
              {t("compactSubtitle")}
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-neutral-400">{t("subtitle")}</p>
              {snapshot.offers.length > 0 ? (
                <p className="mt-1 text-xs text-neutral-500">
                  {t("coverage", { live: liveCount, seed: seedCount })}
                </p>
              ) : null}
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span
            className={
              showCompact
                ? "text-[10px] uppercase tracking-[0.16em] text-neutral-500"
                : "text-xs uppercase tracking-[0.16em] text-neutral-500"
            }
          >
            {statusLabel}
          </span>
          {showCompact ? (
            <Link
              href={seeAllHref}
              className="text-[11px] text-white underline decoration-white/30 underline-offset-2 hover:decoration-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              {t("seeAll")}
            </Link>
          ) : null}
        </div>
      </div>

      {shownOffers.length === 0 ? (
        <p className="border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-neutral-500">
          {t("empty")}
        </p>
      ) : showCompact ? (
        <div className="flow-root">
          <ul
            className="-my-0.5 divide-y divide-white/10 border border-white/10 text-xs"
            aria-label={heading}
          >
            {shownOffers.map((offer, index) => (
              <li
                key={offer.id}
                className="lk-motion-slide-in"
                style={{ animationDelay: `${60 + index * 45}ms` }}
              >
                <a
                  href={offer.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate px-2.5 py-1.5 text-neutral-200 transition hover:bg-white/[0.04] hover:text-white focus-visible:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/40"
                >
                  {formatCompactOfferLine(offer)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul
          className="divide-y divide-white/10 border border-white/10"
          aria-label={heading}
        >
          {shownOffers.map((offer, index) => (
            <li
              key={offer.id}
              className="lk-motion-slide-in"
              style={{ animationDelay: `${80 + index * 55}ms` }}
            >
              <a
                href={offer.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 transition hover:bg-white/[0.04] focus-visible:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/40"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                    {offer.bank}
                    {offer.isSeed ? (
                      <span className="ml-2 font-normal normal-case tracking-normal text-neutral-600">
                        {t("bankSeed")}
                      </span>
                    ) : (
                      <span className="ml-2 font-normal normal-case tracking-normal text-neutral-600">
                        {t("bankLive")}
                      </span>
                    )}
                    {offer.weekdayHint ? (
                      <>
                        {" · "}
                        <span className="normal-case capitalize">
                          {t("weekday", { day: offer.weekdayHint })}
                        </span>
                      </>
                    ) : null}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {offer.discountLabel}
                  </p>
                </div>
                <p className="mt-1 text-sm font-medium text-neutral-100">
                  {offer.merchant}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                  {offer.title}
                </p>
                {offer.validTo ? (
                  <p className="mt-1 text-xs text-neutral-600">
                    {t("validTo", { date: offer.validTo })}
                  </p>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      )}

      <footer
        className={
          showCompact
            ? "text-[11px] leading-snug text-neutral-500"
            : "space-y-1 text-xs text-neutral-500"
        }
      >
        {showCompact ? (
          <p className="max-w-prose">{t("honesty")}</p>
        ) : (
          <>
            <p>{t("honesty")}</p>
            <p>
              {t("asOf", { date: snapshot.asOf })} ·{" "}
              <Link
                href={getSourceProvenancePath(snapshot.sourceId)}
                className="text-white underline decoration-white/30 hover:decoration-white"
              >
                {t("source")}
              </Link>
            </p>
          </>
        )}
      </footer>
    </section>
  );
}
