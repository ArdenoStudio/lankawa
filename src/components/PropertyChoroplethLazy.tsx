"use client";

import dynamic from "next/dynamic";
import { DataSaverMapFallback } from "@/components/DataSaverMapFallback";
import { useDataSaver } from "@/components/DataSaverProvider";
import type { PropertySnapshot } from "@/lib/types";

const PropertyChoroplethMapDynamic = dynamic(
  () =>
    import("@/components/PropertyChoroplethMap").then(
      (mod) => mod.PropertyChoroplethMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 text-sm text-slate-400">
        Loading map…
      </div>
    ),
  },
);

export function PropertyChoroplethMap({
  height = 420,
  snapshot,
}: {
  height?: number;
  snapshot?: PropertySnapshot;
}) {
  const { enabled, hydrated } = useDataSaver();

  if (!hydrated) {
    return <DataSaverMapFallback height={height} pending />;
  }

  if (enabled) {
    return <DataSaverMapFallback height={height} />;
  }

  return <PropertyChoroplethMapDynamic height={height} snapshot={snapshot} />;
}
