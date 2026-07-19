"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import type { FreshnessTier } from "@/lib/types";

/** Monochrome status chips — hierarchy via weight/opacity, not hue. */
const tierStyles: Record<FreshnessTier, string> = {
  fresh: "bg-white text-black ring-white",
  stale: "bg-white/10 text-neutral-200 ring-white/35",
  down: "bg-transparent text-neutral-400 ring-white/25",
  unknown: "bg-transparent text-neutral-500 ring-white/15",
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
