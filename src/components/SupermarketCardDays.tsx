import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getTodaysCardOffers } from "@/lib/integrations/card-offers";
import { getSourceProvenancePath } from "@/lib/sources";

export async function SupermarketCardDays() {
  const t = await getTranslations("cardOffers");
  const snapshot = await getTodaysCardOffers();

  return (
    <section className="space-y-4 border border-white/15 bg-black px-4 py-5 sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">{t("subtitle")}</p>
        </div>
        <span className="text-xs uppercase tracking-[0.16em] text-neutral-500">
          {snapshot.isSeed ? t("seed") : t("live")}
        </span>
      </div>

      {snapshot.offers.length === 0 ? (
        <p className="border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-500">
          {t("empty")}
        </p>
      ) : (
        <ul className="divide-y divide-white/10 border border-white/10">
          {snapshot.offers.map((offer) => (
            <li key={offer.id}>
              <a
                href={offer.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 transition hover:bg-white/[0.04]"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                    {offer.bank}
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

      <footer className="space-y-1 text-xs text-neutral-500">
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
      </footer>
    </section>
  );
}
