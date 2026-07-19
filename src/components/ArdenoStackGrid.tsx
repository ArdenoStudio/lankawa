import { Link } from "@/i18n/navigation";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { computeFreshnessTier } from "@/lib/freshness";
import { getSource } from "@/lib/sources";
import type { ArdenoModuleCard } from "@/lib/types";

function statusToTier(status?: string) {
  switch (status) {
    case "healthy":
      return "fresh" as const;
    case "degraded":
      return "stale" as const;
    case "down":
      return "down" as const;
    default:
      return "stale" as const;
  }
}

export function ArdenoStackGrid({ modules }: { modules: ArdenoModuleCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((module) => {
        const source = getSource(module.sourceId);
        const tier = computeFreshnessTier(
          new Date().toISOString(),
          source?.cadenceMinutes ?? 43200,
        );

        return (
          <Link
            key={module.id}
            href={module.href}
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-teal-400/30 hover:bg-teal-500/5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-white group-hover:text-teal-100">
                {module.title}
              </h3>
              <FreshnessBadge tier={statusToTier(module.status) ?? tier} />
            </div>
            <p className="mt-2 text-sm text-slate-400">{module.description}</p>
            {module.metricLabel && module.metricValue ? (
              <p className="mt-4 text-sm text-slate-300">
                <span className="text-slate-500">{module.metricLabel}: </span>
                {module.metricValue}
              </p>
            ) : null}
            <p className="mt-4 text-xs text-teal-300 group-hover:text-teal-200">
              {source?.name ?? module.sourceId}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

export function LifeDomainGrid({
  domains,
}: {
  domains: Array<{
    key: string;
    label: string;
    category: string;
    status: string;
    summary: string;
    metrics: Array<{ label: string; value: number; unit: string }>;
  }>;
}) {
  const hrefByKey: Record<string, string> = {
    food: "/food",
    fuel: "/economy",
    property: "/property",
    vehicle: "/vehicles",
    transport: "/transport",
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {domains
        .filter((domain) => hrefByKey[domain.key])
        .map((domain) => (
          <Link
            key={domain.key}
            href={hrefByKey[domain.key]!}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-teal-400/30"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-white">{domain.label}</h3>
              <FreshnessBadge tier={statusToTier(domain.status)} />
            </div>
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
              {domain.category}
            </p>
            <p className="mt-2 text-sm text-slate-400">{domain.summary}</p>
            <ul className="mt-4 space-y-1 text-sm text-slate-300">
              {domain.metrics.slice(0, 2).map((metric) => (
                <li key={metric.label}>
                  {metric.label}: {metric.value.toLocaleString()} {metric.unit}
                </li>
              ))}
            </ul>
          </Link>
        ))}
    </div>
  );
}
