import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMacroObservationsStrip } from "@/lib/macro-observations";
import { getSourceProvenancePath } from "@/lib/sources";

export async function MacroObservationsStrip({ locale }: { locale: string }) {
  const t = await getTranslations("economy");
  const snapshot = getMacroObservationsStrip();

  return (
    <section className="space-y-3 border-y border-white/10 py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {t("macroObs.title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            {t("macroObs.subtitle")}
          </p>
        </div>
        <Link
          href={getSourceProvenancePath(snapshot.sourceId)}
          className="text-sm text-white underline decoration-white/30 hover:decoration-white"
        >
          {snapshot.sourceName}
        </Link>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {snapshot.observations.map((item) => (
          <div key={item.id}>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">
              {item.label}
            </dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
              {item.unit === "%" || item.unit === "USD bn"
                ? item.value.toFixed(1)
                : item.value.toLocaleString(locale)}
              <span className="ml-1 text-sm font-normal text-neutral-400">
                {item.unit}
              </span>
            </dd>
            <dd className="mt-1 text-xs text-neutral-500">{item.period}</dd>
          </div>
        ))}
      </dl>

      <p className="text-xs text-neutral-500">
        {t("macroObs.asOf", {
          date: new Date(snapshot.asOf).toLocaleDateString(locale),
        })}
        {snapshot.isSeed ? ` · ${t("macroObs.seed")}` : null}
        {" · "}
        {t("macroObs.honesty")}
      </p>
    </section>
  );
}
