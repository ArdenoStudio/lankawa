import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import type { IrrigationGaugesSnapshot } from "@/lib/integrations/irrigation-gauges";

const ALERT_STYLES: Record<string, string> = {
  NORMAL: "border-white/15 bg-white/5 text-neutral-200",
  ALERT: "border-white/25 bg-white/10 text-white",
  WARNING: "border-white/35 bg-white/15 text-white",
  DANGER: "border-white/50 bg-white/20 text-white",
  UNKNOWN: "border-white/10 bg-black/20 text-neutral-400",
};

function alertClass(status: string): string {
  return ALERT_STYLES[status] ?? ALERT_STYLES.UNKNOWN;
}

export function IrrigationGaugesPanel({
  snapshot,
  locale,
  labels,
}: {
  snapshot: IrrigationGaugesSnapshot;
  locale: string;
  labels: {
    title: string;
    subtitle: string;
    seed: string;
    empty: string;
    honesty: string;
    asOf: string;
    source: string;
    dashboard: string;
    stations: string;
    elevated: string;
    level: string;
    rain: string;
    normal: string;
    alert: string;
    warning: string;
    danger: string;
  };
}) {
  const spotlight = snapshot.gauges
    .filter((gauge) => gauge.alertStatus !== "NORMAL")
    .slice(0, 8);
  const display =
    spotlight.length > 0 ? spotlight : snapshot.gauges.slice(0, 6);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["NORMAL", labels.normal, snapshot.summaryByStatus.NORMAL],
            ["ALERT", labels.alert, snapshot.summaryByStatus.ALERT],
            ["WARNING", labels.warning, snapshot.summaryByStatus.WARNING],
            ["DANGER", labels.danger, snapshot.summaryByStatus.DANGER],
          ] as const
        ).map(([key, label, count]) => (
          <article
            key={key}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-white">
              {count}
            </p>
            <p className="mt-1 text-xs text-slate-500">{labels.stations}</p>
          </article>
        ))}
      </div>

      {display.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-500">
          {labels.empty}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {display.map((gauge) => (
            <article
              key={gauge.gauge}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{gauge.gauge}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{gauge.basin}</p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${alertClass(gauge.alertStatus)}`}
                >
                  {gauge.alertStatus}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-slate-500">{labels.level}</dt>
                  <dd className="font-medium tabular-nums text-slate-200">
                    {gauge.waterLevel != null
                      ? `${gauge.waterLevel.toFixed(2)} m`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">{labels.rain}</dt>
                  <dd className="font-medium tabular-nums text-slate-200">
                    {gauge.rainFall != null
                      ? `${gauge.rainFall.toFixed(1)} mm`
                      : "—"}
                  </dd>
                </div>
              </dl>
              {gauge.observedAt ? (
                <p className="mt-2 text-xs text-slate-500">
                  {new Date(gauge.observedAt).toLocaleString(locale)}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500">
        {labels.asOf.replace(
          "{date}",
          new Date(snapshot.asOf).toLocaleString(locale),
        )}
        {snapshot.elevatedCount > 0
          ? ` · ${labels.elevated.replace("{count}", String(snapshot.elevatedCount))}`
          : ""}{" "}
        · {labels.honesty}
      </p>
      <p className="text-xs text-slate-500">
        <Link
          href={snapshot.provenancePath}
          className="text-white underline decoration-white/30 hover:decoration-white"
        >
          {labels.source}
        </Link>
        {" · "}
        <a
          href={snapshot.dashboardUrl}
          target="_blank"
          rel="noreferrer"
          className="text-white underline decoration-white/30 hover:decoration-white"
        >
          {labels.dashboard}
        </a>
      </p>
    </section>
  );
}
