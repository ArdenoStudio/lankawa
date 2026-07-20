import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  fetchSingerEmiSnapshot,
  formatTenorsLabel,
} from "@/lib/integrations/singer-emi";
import { getSourceProvenancePath } from "@/lib/sources";

export async function HouseholdEmiStrip() {
  const t = await getTranslations("householdEmi");
  const snapshot = await fetchSingerEmiSnapshot();
  const priceLabel = snapshot.sampleProduct.productPriceLkr.toLocaleString("en-LK");

  return (
    <section
      id="household-emi"
      className="space-y-3 border border-white/15 bg-black px-4 py-5 sm:px-5"
      aria-labelledby="household-emi-title"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="household-emi-title"
            className="text-xl font-semibold tracking-tight text-white"
          >
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">{t("subtitle")}</p>
          <p className="mt-1 text-xs text-neutral-500">
            {t("sample", {
              label: snapshot.sampleProduct.label,
              price: priceLabel,
            })}
          </p>
        </div>
        <span className="text-xs uppercase tracking-[0.16em] text-neutral-500">
          {snapshot.isSeed ? t("seed") : t("live")}
        </span>
      </div>

      {snapshot.banks.length === 0 ? (
        <p className="border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-500">
          {t("empty")}
        </p>
      ) : (
        <ul className="divide-y divide-white/10 border border-white/10">
          {snapshot.banks.map((bank) => {
            const shortest =
              bank.sampleMonthlyFormatted.length > 0
                ? bank.sampleMonthlyFormatted[bank.sampleMonthlyFormatted.length - 1]
                : null;
            return (
              <li
                key={bank.id}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-100">{bank.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {t("tenors", { months: formatTenorsLabel(bank.tenorsMonths) })}
                    {bank.callConvert ? (
                      <span className="ml-2 text-neutral-600">{t("callConvert")}</span>
                    ) : null}
                  </p>
                </div>
                {shortest ? (
                  <p className="text-sm tabular-nums text-white">
                    {t("monthlyFrom", { amount: shortest })}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <footer className="space-y-1 text-xs text-neutral-500">
        <p>
          {t("summary", {
            banks: snapshot.banks.length,
            callConvert: snapshot.callConvertCount,
            defaults: formatTenorsLabel(snapshot.defaultTenorsMonths),
          })}
        </p>
        <p>{t("honesty")}</p>
        <p>
          {t("asOf", { date: snapshot.asOf })} ·{" "}
          <a
            href={snapshot.sampleProduct.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {t("singerLink")}
          </a>
          {" · "}
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
