"use client";

import { useTranslations } from "next-intl";

export function DataSaverMapFallback({
  height = 420,
  pending = false,
}: {
  height?: number;
  pending?: boolean;
}) {
  const t = useTranslations("dataSaver");

  return (
    <div
      className="flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-center"
      style={{ minHeight: height }}
    >
      <div>
        <p className="text-sm font-medium text-white">
          {pending ? t("mapPendingTitle") : t("mapSkippedTitle")}
        </p>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          {pending ? t("mapPendingBody") : t("mapSkippedBody")}
        </p>
      </div>
    </div>
  );
}

