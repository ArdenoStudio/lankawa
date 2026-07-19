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

        return (
          <div
            key={item.slug}
            className={`rounded-2xl border p-4 ${
              isCoconut
                ? "border-white/30 bg-white/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            {isCoconut ? (
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                {t("coconutIndexBadge")}
              </p>
            ) : null}
            <p className="font-medium text-white">{item.name}</p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                isCoconut ? "text-white" : "text-teal-200"
              }`}
            >
              LKR {item.priceLkr.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {t("perUnit", { unit: item.unit })} · {item.source}
            </p>
          </div>
        );
      })}
    </div>
  );
}
