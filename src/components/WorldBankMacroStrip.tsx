import { getTranslations } from "next-intl/server";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import { fetchWorldBankLkaSnapshot } from "@/lib/integrations/world-bank";
import { getSourceProvenancePath } from "@/lib/sources";

function formatIndicator(
  locale: string,
  id: string,
  value: number,
  unit: string,
): string {
  if (unit === "%") {
    return `${value.toFixed(1)}%`;
  }
  if (id === "population") {
    return value.toLocaleString(locale);
  }
  return `${value.toLocaleString(locale)} ${unit}`.trim();
}

export async function WorldBankMacroStrip({ locale }: { locale: string }) {
  const t = await getTranslations("economy");
  const snapshot = await fetchWorldBankLkaSnapshot();

  if (!snapshot) {
    return (
      <section className="space-y-2 border-y border-white/10 py-5">
        <h2 className="text-lg font-semibold text-white">
          {t("worldBank.title")}
        </h2>
        <p className="text-sm text-neutral-500">{t("worldBank.unavailable")}</p>
      </section>
    );
  }

  const labelFor = (id: string): string => {
    switch (id) {
      case "gdp_growth":
        return t("worldBank.gdp");
      case "cpi_inflation":
        return t("worldBank.cpi");
      case "population":
        return t("worldBank.population");
      default:
        return id;
    }
  };

  return (
    <section className="space-y-3 border-y border-white/10 py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {t("worldBank.title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            {t("worldBank.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FreshnessBadge tier={snapshot.tier} />
          <Link
            href={getSourceProvenancePath(snapshot.sourceId)}
            className="text-sm text-white underline decoration-white/30 hover:decoration-white"
          >
            {t("worldBank.provenance")}
          </Link>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {snapshot.indicators.map((item) => (
          <div key={item.id}>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">
              {labelFor(item.id)}
            </dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
              {formatIndicator(locale, item.id, item.value, item.unit)}
            </dd>
            <dd className="mt-1 text-xs text-neutral-500">{item.year}</dd>
          </div>
        ))}
      </dl>

      <p className="text-xs text-neutral-500">
        {t("worldBank.asOf", {
          date: new Date(snapshot.asOf).toLocaleDateString(locale),
        })}
        {snapshot.isSeed ? ` · ${t("worldBank.seed")}` : null}
        {" · "}
        {t("worldBank.honesty")}
        {" · "}
        {t("worldBank.vintage", {
          years: [
            ...new Set(snapshot.indicators.map((item) => item.year)),
          ].join(", "),
        })}
      </p>
    </section>
  );
}
