import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import type { LpgPriceSnapshot } from "@/lib/integrations/lpg";
import { estimateDomesticBill } from "@/lib/pucsl";
import type { FreshnessTier } from "@/lib/types";

export function HouseholdEnergySection({
  fuel,
  lpg,
  locale,
  labels,
}: {
  fuel: Array<{
    id: string;
    label: string;
    value: string;
    unit?: string;
    tier: FreshnessTier;
  }>;
  lpg: LpgPriceSnapshot;
  locale: string;
  labels: {
    title: string;
    subtitle: string;
    fuelTitle: string;
    lpgTitle: string;
    tariffTitle: string;
    tariffTeaser: string;
    tariffCta: string;
    cylinder12_5: string;
    emptyFuel: string;
    emptyLpg: string;
  };
}) {
  const colomboLpg = lpg.prices
    .filter(
      (price) =>
        price.district.toLowerCase() === "colombo" && price.cylinderKg === 12.5,
    )
    .sort((a, b) => a.provider.localeCompare(b.provider));

  const estimate = estimateDomesticBill(90);

  return (
    <section id="household-energy" className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
        <p className="mt-1 text-sm text-slate-400">{labels.subtitle}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-500">{labels.fuelTitle}</p>
          {fuel.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">{labels.emptyFuel}</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {fuel.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.value}
                      {item.unit ? ` ${item.unit}` : ""}
                    </p>
                  </div>
                  <FreshnessBadge tier={item.tier} />
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-slate-500">{labels.lpgTitle}</p>
            <FreshnessBadge tier={lpg.tier} />
          </div>
          {colomboLpg.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">{labels.emptyLpg}</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {colomboLpg.map((price) => (
                <li
                  key={`${price.provider}-${price.cylinderKg}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {price.provider}
                    </p>
                    <p className="text-xs text-slate-500">
                      Colombo · {labels.cylinder12_5}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {price.priceLkr.toLocaleString(locale, {
                      maximumFractionDigits: 0,
                    })}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      LKR
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-500">{labels.tariffTitle}</p>
          <p className="mt-3 text-sm text-slate-300">{labels.tariffTeaser}</p>
          {estimate ? (
            <p className="mt-3 text-2xl font-semibold text-white">
              {estimate.totalLkr.toLocaleString(locale, {
                maximumFractionDigits: 0,
              })}
              <span className="ml-1 text-sm font-normal text-slate-400">
                LKR / 90 kWh
              </span>
            </p>
          ) : null}
          <Link
            href="/economy#household-tariffs"
            className="mt-4 inline-block text-sm text-teal-300 hover:text-teal-200"
          >
            {labels.tariffCta} →
          </Link>
        </article>
      </div>
    </section>
  );
}
