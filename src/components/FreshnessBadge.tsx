"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import type { FreshnessTier } from "@/lib/types";

const tierStyles: Record<FreshnessTier, string> = {
  fresh: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  stale: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  down: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  unknown: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
};

export function FreshnessBadge({ tier }: { tier: FreshnessTier }) {
  const t = useTranslations("freshness");

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tierStyles[tier],
      )}
    >
      {t(tier)}
    </span>
  );
}
