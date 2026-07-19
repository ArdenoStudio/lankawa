"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

export interface DistrictShareMetric {
  id: string;
  label: string;
  value: string;
  note?: string;
}

export function ShareDistrictCard({
  districtName,
  url,
  metrics,
}: {
  districtName: string;
  url: string;
  metrics: DistrictShareMetric[];
}) {
  const t = useTranslations("shareDistrict");
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const summary = useMemo(() => {
    const lines = metrics.map((metric) => {
      return `${metric.label}: ${metric.value}${metric.note ? ` (${metric.note})` : ""}`;
    });

    return [
      t("title", { name: districtName }),
      ...lines,
      url,
      t("footer"),
    ].join("\n");
  }, [districtName, metrics, t, url]);

  async function handleShare() {
    setStatus("idle");

    try {
      if (navigator.share) {
        await navigator.share({
          title: t("title", { name: districtName }),
          text: summary,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(summary);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
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
