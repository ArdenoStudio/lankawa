import { getTranslations } from "next-intl/server";
import { FreshnessBadge } from "./FreshnessBadge";
import { Link } from "@/i18n/navigation";
import type { PulseMetric } from "@/lib/types";

function MetricGlyph({ id }: { id: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    className: "h-4 w-4",
    "aria-hidden": true as const,
  };

  switch (id) {
    case "usd_lkr":
      return (
        <svg {...common}>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      );
    case "fuel_petrol_92":
    case "fuel_diesel":
      return (
        <svg {...common}>
          <path d="M4 20V8a2 2 0 012-2h6a2 2 0 012 2v12M10 6V4M14 11h2a2 2 0 012 2v3a2 2 0 002 2h0a2 2 0 002-2V9l-3-3" />
        </svg>
      );
    case "weather_colombo":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case "power_status":
      return (
        <svg {...common}>
          <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
        </svg>
      );
    case "flood_stations":
      return (
        <svg {...common}>
          <path d="M3 15c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2M3 20c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2M12 3v7" />
        </svg>
      );
    case "aqi_colombo":
      return (
        <svg {...common}>
          <path d="M4 14c2.5-1 4-4 8-4s5.5 3 8 4M4 9c2.5-1 4-4 8-4s5.5 3 8 4M4 19c2.5-1 4-4 8-4s5.5 3 8 4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
          <path d="M12 8v4l2.5 2.5" />
        </svg>
      );
  }
}

export async function PulseCard({
  metric,
  featured = false,
}: {
  metric: PulseMetric;
  featured?: boolean;
}) {
  const t = await getTranslations("pulse");

  return (
    <article
      className={
        featured
          ? "lk-card lk-card-interactive group relative h-full overflow-hidden p-6 lg:p-7"
          : "lk-card lk-card-interactive group relative h-full overflow-hidden p-5"
      }
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70"
        aria-hidden="true"
      />
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="lk-icon-ring h-8 w-8 shrink-0 text-neutral-200">
            <MetricGlyph id={metric.id} />
          </span>
          <h3 className="text-sm font-medium text-neutral-300">{metric.label}</h3>
        </div>
        <FreshnessBadge tier={metric.tier} />
      </div>
      <p
        className={
          featured
            ? "font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl"
            : "font-display text-3xl font-semibold tracking-tight text-white"
        }
      >
        {metric.value}
        {metric.unit ? (
          <span className="ml-2 text-base font-normal text-neutral-400">
            {metric.unit}
          </span>
        ) : null}
      </p>
      {metric.note ? (
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          {metric.note}
        </p>
      ) : null}
      <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3 text-xs text-neutral-500">
        <span>
          {metric.observedAt
            ? t("asOf", {
                date: new Date(metric.observedAt).toLocaleString(),
              })
            : t("noTimestamp")}
        </span>
        <Link
          href={metric.provenancePath}
          className="text-neutral-300 underline decoration-white/25 underline-offset-2 transition hover:text-white hover:decoration-white/60"
        >
          {t("provenance")}
        </Link>
      </footer>
    </article>
  );
}
