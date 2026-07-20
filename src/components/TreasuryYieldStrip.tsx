import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSourceProvenancePath } from "@/lib/sources";
import { getTreasuryYieldSnapshot } from "@/lib/treasury";

export async function TreasuryYieldStrip({ locale }: { locale: string }) {
  const t = await getTranslations("economy");
  const snapshot = getTreasuryYieldSnapshot();

  return (
    <section className="space-y-3 border-y border-white/10 py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{t("treasury.title")}</h2>
          <p className="mt-1 text-sm text-neutral-400">{t("treasury.subtitle")}</p>
        </div>
        <Link
          href={getSourceProvenancePath(snapshot.sourceId)}
          className="text-sm text-white underline decoration-white/30 hover:decoration-white"
        >
          {snapshot.sourceName}
        </Link>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            {t("treasury.wayr")}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {snapshot.wayr.toFixed(2)}
            <span className="ml-1 text-sm font-normal text-neutral-400">
              {snapshot.unit}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            {t("treasury.tbill91")}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {snapshot.tbill91.toFixed(2)}
            <span className="ml-1 text-sm font-normal text-neutral-400">
              {snapshot.unit}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            {t("treasury.tbill182")}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {snapshot.tbill182.toFixed(2)}
            <span className="ml-1 text-sm font-normal text-neutral-400">
              {snapshot.unit}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            {t("treasury.tbill364")}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {snapshot.tbill364.toFixed(2)}
            <span className="ml-1 text-sm font-normal text-neutral-400">
              {snapshot.unit}
            </span>
          </dd>
        </div>
      </dl>

      <p className="text-xs text-neutral-500">
        {t("treasury.asOf", {
          date: new Date(snapshot.asOf).toLocaleDateString(locale),
        })}
        {snapshot.isSeed ? ` · ${t("treasury.seed")}` : null}
      </p>
    </section>
  );
}
