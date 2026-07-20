"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { DistrictCompareRow } from "@/lib/compare";
import { formatPropertyPrice } from "@/lib/property";

function formatDelta(value: number | null): string {
  if (value == null) {
    return "—";
  }
  return `${value > 0 ? "+" : ""}${value}`;
}

export function ShareCompareCard({ rows }: { rows: DistrictCompareRow[] }) {
  const t = useTranslations("shareCompare");
  const tc = useTranslations("compare");
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const summary = useMemo(() => {
    if (rows.length === 0) {
      return "";
    }

    const names = rows.map((row) => row.name).join(" vs ");
    const blocks = rows.map((row) => {
      const lines = [
        `*${row.name}*`,
        `${tc("population")}: ${row.population.toLocaleString()}`,
        `${tc("dengueCases")}: ${row.dengueCases != null ? row.dengueCases.toLocaleString() : "—"}`,
        `${tc("costOfLiving")}: ${row.costOfLivingIndex != null ? row.costOfLivingIndex : "—"}`,
        `${tc("propertyAvgPrice")}: ${
          row.propertyAvgPrice != null
            ? `LKR ${formatPropertyPrice(row.propertyAvgPrice)}/perch`
            : "—"
        }`,
        `${tc("greeneryDelta")}: ${formatDelta(row.greeneryDelta)}`,
        `${tc("aqi")}: ${row.aqi != null ? row.aqi : "—"}`,
        `${tc("floodStations")}: ${row.floodStationCount}`,
      ];
      return lines.join("\n");
    });

    return [t("title", { names }), "", ...blocks, "", t("footer")].join("\n");
  }, [rows, t, tc]);

  async function handleShare() {
    if (!summary) {
      return;
    }

    setStatus("idle");

    try {
      if (navigator.share) {
        await navigator.share({
          title: t("title", {
            names: rows.map((row) => row.name).join(" vs "),
          }),
          text: summary,
        });
        return;
      }

      await navigator.clipboard.writeText(summary);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <button
        type="button"
        onClick={handleShare}
        className="rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-slate-200"
      >
        {t("button")}
      </button>
      <p className="text-xs text-slate-500" aria-live="polite">
        {status === "copied"
          ? t("copied")
          : status === "error"
            ? t("error")
            : t("hint")}
      </p>
    </div>
  );
}
