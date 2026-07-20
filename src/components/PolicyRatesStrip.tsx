import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fetchCbslPolicyRatesSnapshot } from "@/lib/integrations/cbsl-policy-rates";
import { getSourceProvenancePath } from "@/lib/sources";

export async function PolicyRatesStrip({ locale }: { locale: string }) {
  const t = await getTranslations("economy");
  const snapshot = await fetchCbslPolicyRatesSnapshot();

  return (
    <section className="space-y-3 border-y border-white/10 py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {t("policyRates.title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            {t("policyRates.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <a
            href={snapshot.policyPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {t("policyRates.cbslLink")}
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
            {t("policyRates.opr")}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {snapshot.opr.toFixed(2)}
            <span className="ml-1 text-sm font-normal text-neutral-400">
              {snapshot.unit}
            </span>
          </dd>
          <dd className="mt-1 text-xs text-neutral-500">
            {snapshot.oprIsLive
              ? t("policyRates.liveBadge")
              : t("policyRates.seedBadge")}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            {t("policyRates.sdfr")}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {snapshot.sdfr.toFixed(2)}
            <span className="ml-1 text-sm font-normal text-neutral-400">
              {snapshot.unit}
            </span>
          </dd>
          <dd className="mt-1 text-xs text-neutral-500">
            {t("policyRates.corridorBadge")}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            {t("policyRates.slfr")}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {snapshot.slfr.toFixed(2)}
            <span className="ml-1 text-sm font-normal text-neutral-400">
              {snapshot.unit}
            </span>
          </dd>
          <dd className="mt-1 text-xs text-neutral-500">
            {t("policyRates.corridorBadge")}
          </dd>
        </div>
        {snapshot.srr != null ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">
              {t("policyRates.srr")}
            </dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
              {snapshot.srr.toFixed(2)}
              <span className="ml-1 text-sm font-normal text-neutral-400">
                {snapshot.unit}
              </span>
            </dd>
          </div>
        ) : null}
      </dl>

      <p className="text-xs text-neutral-500">
        {t("policyRates.asOf", {
          date: new Date(snapshot.asOf).toLocaleDateString(locale),
        })}
        {snapshot.effectiveDate
          ? ` · ${t("policyRates.effective", {
              date: new Date(snapshot.effectiveDate).toLocaleDateString(locale),
            })}`
          : null}
        {snapshot.isSeed ? ` · ${t("policyRates.seed")}` : null}
        {snapshot.corridorIsSeed && !snapshot.isSeed
          ? ` · ${t("policyRates.corridorSeed")}`
          : null}
        {" · "}
        {t("policyRates.honesty")}
      </p>
    </section>
  );
}
