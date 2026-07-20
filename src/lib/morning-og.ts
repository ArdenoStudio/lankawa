import type { PulseSnapshot } from "@/lib/types";

export interface MorningOgMetric {
  id: string;
  label: string;
  value: string;
}

const PREFERRED = ["usd_lkr", "fuel_petrol_92", "flood_stations", "weather_colombo"];

export function pickMorningOgMetrics(
  snapshot: PulseSnapshot,
  limit = 4,
): MorningOgMetric[] {
  const byId = new Map(snapshot.metrics.map((metric) => [metric.id, metric]));
  const ordered = [
    ...PREFERRED.map((id) => byId.get(id)).filter(
      (metric): metric is NonNullable<typeof metric> => metric != null,
    ),
    ...snapshot.metrics.filter((metric) => !PREFERRED.includes(metric.id)),
  ];

  return ordered.slice(0, limit).map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: `${metric.value}${metric.unit ? ` ${metric.unit}` : ""}`,
  }));
}

/** Escape text for SVG attribute / text nodes. */
export function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderMorningOgSvg(input: {
  title: string;
  asOf: string;
  metrics: MorningOgMetric[];
}): string {
  const rows = input.metrics
    .map((metric, index) => {
      const y = 140 + index * 56;
      return [
        `<text x="64" y="${y}" fill="#a3a3a3" font-size="18" font-family="ui-sans-serif, system-ui, sans-serif">${escapeSvgText(metric.label)}</text>`,
        `<text x="64" y="${y + 28}" fill="#fafafa" font-size="28" font-weight="600" font-family="ui-sans-serif, system-ui, sans-serif">${escapeSvgText(metric.value)}</text>`,
      ].join("");
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <rect x="0" y="0" width="1200" height="8" fill="#fafafa"/>
  <text x="64" y="72" fill="#fafafa" font-size="42" font-weight="700" font-family="ui-sans-serif, system-ui, sans-serif">${escapeSvgText(input.title)}</text>
  <text x="64" y="108" fill="#737373" font-size="20" font-family="ui-sans-serif, system-ui, sans-serif">${escapeSvgText(input.asOf)}</text>
  ${rows}
  <text x="64" y="590" fill="#525252" font-size="16" font-family="ui-sans-serif, system-ui, sans-serif">lankawa · morning metrics</text>
</svg>`;
}
