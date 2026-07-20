"use client";

import { useTranslations } from "next-intl";
import { getFoodSnapshot } from "@/lib/food";
import type { FoodSnapshot } from "@/lib/types";

export function FoodStapleGrid({
  snapshot: snapshotProp,
}: {
  snapshot?: FoodSnapshot;
}) {
  const t = useTranslations("food");
  const snapshot = snapshotProp ?? getFoodSnapshot();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {snapshot.stapleItems.map((item) => {
        const isCoconut = item.slug === "coconut";
        const isStale = item.stale === true;

        return (
          <div
            key={item.slug}
            className={`rounded-2xl border p-4 ${
              isStale
                ? "border-amber-400/35 bg-amber-400/[0.06]"
                : isCoconut
                  ? "border-white/30 bg-white/10"
                  : "border-white/10 bg-white/5"
            }`}
          >
            {isCoconut || isStale ? (
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {isCoconut ? (
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    {t("coconutIndexBadge")}
                  </p>
                ) : null}
                {isStale ? (
                  <p className="rounded-md border border-amber-300/50 bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-50">
                    {t("staleStaple")}
                  </p>
                ) : null}
              </div>
            ) : null}
            <p className="font-medium text-white">{item.name}</p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                isStale ? "text-amber-50" : "text-white"
              }`}
            >
              LKR {item.priceLkr.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {t("perUnit", { unit: item.unit })} · {item.source}
              {item.quoteAsOf ? ` · ${item.quoteAsOf}` : ""}
            </p>
            {item.note ? (
              <p
                className={`mt-2 text-xs leading-snug ${
                  isStale ? "text-amber-50/85" : "text-slate-400"
                }`}
              >
                {item.note}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
