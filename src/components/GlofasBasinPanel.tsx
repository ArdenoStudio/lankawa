import { MonoLineChart } from "@/components/charts/MonoLineChart";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import type { GlofasBasinSnapshot } from "@/lib/integrations/glofas";

export function GlofasBasinPanel({
  snapshot,
  labels,
}: {
  snapshot: GlofasBasinSnapshot;
  labels: {
    title: string;
    subtitle: string;
    seed: string;
    discharge: string;
    empty: string;
    honesty: string;
    asOf: string;
  };
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-neutral-400">
            {labels.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {snapshot.isSeed ? (
            <span className="text-xs uppercase tracking-wide text-neutral-500">
              {labels.seed}
            </span>
          ) : null}
          <FreshnessBadge tier={snapshot.tier} />
        </div>
      </div>

      {snapshot.basins.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-500">
          {labels.empty}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {snapshot.basins.map((basin) => (
            <article
              key={basin.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <h3 className="text-sm font-semibold text-white">{basin.label}</h3>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
                {basin.latestDischargeM3s != null
                  ? basin.latestDischargeM3s.toFixed(1)
                  : "—"}
                <span className="ml-1 text-sm font-normal text-neutral-400">
                  m³/s
                </span>
              </p>
              <p className="mt-1 text-xs text-neutral-500">{labels.discharge}</p>
              {basin.series.length >= 2 ? (
                <div className="mt-3">
                  <MonoLineChart
                    id={`glofas-${basin.id}`}
                    ariaLabel={basin.label}
                    series={[
                      {
                        id: basin.id,
                        values: basin.series,
                        area: true,
                        className: "text-white",
                      },
                    ]}
                    height={80}
                    padX={28}
                    valueFormat={(value) => value.toFixed(0)}
                  />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-500">
        {labels.asOf.replace(
          "{date}",
          new Date(snapshot.asOf).toLocaleString(),
        )}{" "}
        · {labels.honesty}
      </p>
    </section>
  );
}
