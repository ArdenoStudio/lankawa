"use client";

import { useTranslations } from "next-intl";
import { getVehicleSnapshot } from "@/lib/vehicle";
import type { VehicleSnapshot } from "@/lib/types";

export function VehiclePopularMakes({
  snapshot: snapshotProp,
}: {
  snapshot?: VehicleSnapshot;
}) {
  const t = useTranslations("vehicles");
  const snapshot = snapshotProp ?? getVehicleSnapshot();
  const maxCount = snapshot.popularMakes[0]?.count ?? 1;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {snapshot.popularMakes.map((make) => (
        <div
          key={make.make}
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <p className="text-sm text-slate-400">{make.make}</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {make.count.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">{t("listingsLabel")}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-teal-400"
              style={{ width: `${(make.count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
