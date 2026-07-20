import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPaymentsBulletinSnapshot } from "@/lib/payments-bulletin";
import { getSourceProvenancePath } from "@/lib/sources";

function formatMillionFromThousand(
  volumeThousand: number,
  locale: string,
): string {
  const millions = volumeThousand / 1000;
  return millions.toLocaleString(locale, {
    maximumFractionDigits: millions >= 10 ? 1 : 2,
  });
}

export async function PaymentsBulletinStrip({ locale }: { locale: string }) {
  const t = await getTranslations("economy");
  const snapshot = getPaymentsBulletinSnapshot();

  return (
    <section className="space-y-3 border-y border-white/10 py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {t("paymentsBulletin.title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            {t("paymentsBulletin.subtitle", { period: snapshot.periodLabel })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <a
            href={snapshot.bulletinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {t("paymentsBulletin.pdfLink")}
          </a>
          <Link
            href={getSourceProvenancePath(snapshot.sourceId)}
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {snapshot.sourceName}
          </Link>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            {t("paymentsBulletin.ceftsVolume")}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {formatMillionFromThousand(snapshot.cefts.volumeThousand, locale)}
            <span className="ml-1 text-sm font-normal text-neutral-400">
              {t("paymentsBulletin.unitMillion")}
            </span>
          </dd>
          <dd className="mt-1 text-xs text-neutral-500">
            {t("paymentsBulletin.ceftsValue", {
              value: snapshot.cefts.valueRsBillion.toLocaleString(locale),
            })}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            {t("paymentsBulletin.justpayVolume")}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {formatMillionFromThousand(snapshot.justpay.volumeThousand, locale)}
            <span className="ml-1 text-sm font-normal text-neutral-400">
              {t("paymentsBulletin.unitMillion")}
            </span>
          </dd>
          <dd className="mt-1 text-xs text-neutral-500">
            {t("paymentsBulletin.justpayValue", {
              value: snapshot.justpay.valueRsBillion.toLocaleString(locale),
            })}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            {t("paymentsBulletin.lankaqrVolume")}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {snapshot.lankaqr.domesticVolumeThousand.toLocaleString(locale)}
            <span className="ml-1 text-sm font-normal text-neutral-400">
              {t("paymentsBulletin.unitThousand")}
            </span>
          </dd>
          <dd className="mt-1 text-xs text-neutral-500">
            {t("paymentsBulletin.lankaqrValue", {
              value: (
                snapshot.lankaqr.domesticValueRsMillion / 1000
              ).toLocaleString(locale, { maximumFractionDigits: 2 }),
            })}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            {t("paymentsBulletin.lankaqrMerchants")}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {snapshot.lankaqr.merchantsRegistered.toLocaleString(locale)}
          </dd>
          <dd className="mt-1 text-xs text-neutral-500">
            {t("paymentsBulletin.merchantsNote")}
          </dd>
        </div>
      </dl>

      <p className="text-xs text-neutral-500">
        {t("paymentsBulletin.asOf", {
          date: new Date(snapshot.asOf).toLocaleDateString(locale),
          period: snapshot.period,
        })}
        {snapshot.isSeed ? ` · ${t("paymentsBulletin.seed")}` : null}
        {" · "}
        {t("paymentsBulletin.honesty")}
      </p>
    </section>
  );
}
