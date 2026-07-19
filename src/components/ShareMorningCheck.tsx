"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

export interface MorningCheckShareMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  note?: string;
}

export function ShareMorningCheck({
  metrics,
}: {
  metrics: MorningCheckShareMetric[];
}) {
  const t = useTranslations("shareMorning");
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const summary = useMemo(() => {
    const lines = metrics.map((metric) => {
      const value = [metric.value, metric.unit].filter(Boolean).join(" ");
      return `${metric.label}: ${value}${metric.note ? ` (${metric.note})` : ""}`;
    });

    return [t("title"), ...lines, t("footer")].join("\n");
  }, [metrics, t]);

  async function handleShare() {
    setStatus("idle");

    try {
      if (navigator.share) {
        await navigator.share({
          title: t("title"),
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

  return (
    <div className="flex flex-wrap items-center gap-3">
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

