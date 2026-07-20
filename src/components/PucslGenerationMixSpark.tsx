import { MonoLineChart } from "@/components/charts/MonoLineChart";
import { Link } from "@/i18n/navigation";
import {
  getHydroShareSeries,
  getPucslGenerationMix,
  primaryMixLabel,
} from "@/lib/pucsl-generation";
import { getSourceProvenancePath } from "@/lib/sources";

export function PucslGenerationMixSpark({
  labels,
}: {
  labels: {
    title: string;
    subtitle: string;
    seed: string;
    hydro: string;
    asOf: string;
    honesty: string;
    source: string;
  };
}) {
  const snapshot = getPucslGenerationMix();
  const series = getHydroShareSeries(snapshot);
  const primary = primaryMixLabel(snapshot);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2 lg:col-span-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{labels.title}</h3>
          <p className="mt-1 text-sm text-neutral-400">{labels.subtitle}</p>
        </div>
        {snapshot.isSeed ? (
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            {labels.seed}
          </span>
        ) : null}
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {snapshot.mix.map((item) => (
          <div key={item.id}>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">
              {item.label}
            </dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums text-white">
              {item.sharePct}
              <span className="ml-1 text-sm font-normal text-neutral-400">
                {snapshot.unit}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      {series.length >= 2 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs text-neutral-500">
            {labels.hydro}
            {primary ? ` · lead ${primary.label}` : ""}
          </p>
          <MonoLineChart
            id="pucsl-hydro-mix-spark"
            ariaLabel={labels.hydro}
            series={[
              {
                id: "hydro",
                values: series,
                area: true,
                className: "text-white",
              },
            ]}
            height={96}
            valueFormat={(value) => `${value.toFixed(0)}%`}
          />
        </div>
      ) : null}

      <p className="mt-3 text-xs text-neutral-500">
        {labels.asOf.replace("{date}", snapshot.asOf)} · {labels.honesty}
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        <Link
          href={getSourceProvenancePath("pucsl_tariff")}
          className="text-white underline decoration-white/30 hover:decoration-white"
        >
          {labels.source}
        </Link>
      </p>
    </article>
  );
}
