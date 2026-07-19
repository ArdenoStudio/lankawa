import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getFxSeries } from "@/lib/economy";
import { getFuelHistorySeries } from "@/lib/fuel";

type DeltaItem = {
  id: string;
  label: string;
  delta: number;
  unit: string;
  fractionDigits: number;
  asOf: string;
};

function formatDelta(value: number, fractionDigits: number): string {
  const direction = value > 0 ? "↑" : value < 0 ? "↓" : "→";
  const sign = value > 0 ? "+" : "";
  return `${direction} ${sign}${value.toFixed(fractionDigits)}`;
}

function getLatestPair<T extends { date?: string; recorded_at?: string }>(
  points: T[],
): [T, T] | null {
  if (points.length < 2) {
    return null;
  }

  const sorted = [...points].sort((a, b) => {
    const aDate = a.date ?? a.recorded_at ?? "";
    const bDate = b.date ?? b.recorded_at ?? "";
    return aDate.localeCompare(bDate);
  });

  return [sorted[sorted.length - 2], sorted[sorted.length - 1]];
}

export async function MorningDeltaStrip() {
  const t = await getTranslations("home");
  const [fxSeries, fuelSeries] = await Promise.all([
    getFxSeries(),
    getFuelHistorySeries(10),
  ]);

  const items: DeltaItem[] = [];
  const fxPair = getLatestPair(fxSeries);
  if (fxPair) {
    const [previous, latest] = fxPair;
    items.push({
      id: "fx",
      label: t("morningDeltaFx"),
      delta: latest.sellRate - previous.sellRate,
      unit: "LKR",
      fractionDigits: 2,
      asOf: latest.date,
    });
  }

  for (const series of fuelSeries) {
    const pair = getLatestPair(series.points);
    if (!pair) {
      continue;
    }

    const [previous, latest] = pair;
    items.push({
      id: series.fuelType,
      label:
        series.fuelType === "petrol_92"
          ? t("morningDeltaPetrol")
          : t("morningDeltaDiesel"),
      delta: latest.price_lkr - previous.price_lkr,
      unit: "LKR/L",
      fractionDigits: 0,
      asOf: latest.recorded_at,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className="flex flex-wrap gap-2"
      role="list"
      aria-label={t("morningDeltaLabel")}
    >
      {items.map((item) => (
        <Link
          key={item.id}
          href="/economy"
          role="listitem"
          className="inline-flex min-w-0 flex-1 basis-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:border-white/25 hover:bg-white/10 sm:basis-[calc(33.333%-0.5rem)]"
        >
          <span className="min-w-0">
            <span className="block truncate text-xs uppercase tracking-wide text-slate-500">
              {item.label}
            </span>
            <span className="block truncate text-[11px] text-slate-600">
              {t("morningDeltaAsOf", { date: item.asOf })}
            </span>
          </span>
          <span className="shrink-0 font-semibold text-slate-200">
            {formatDelta(item.delta, item.fractionDigits)}{" "}
            <span className="text-xs font-normal text-slate-400">
              {item.unit}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
