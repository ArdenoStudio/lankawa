"use client";

import dynamic from "next/dynamic";
import { DataSaverMapFallback } from "@/components/DataSaverMapFallback";
import { useDataSaver } from "@/components/DataSaverProvider";
import type { DistrictMapProps } from "@/components/DistrictMap";

const DistrictMap = dynamic(
  () => import("@/components/DistrictMap").then((mod) => mod.DistrictMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 text-sm text-slate-400">
        Loading map…
      </div>
    ),
  },
);

export function DistrictMapLazy(props: DistrictMapProps) {
  const { enabled, hydrated } = useDataSaver();
  const height = props.height ?? 420;

  if (!hydrated) {
    return <DataSaverMapFallback height={height} pending />;
  }

  if (enabled) {
    return <DataSaverMapFallback height={height} />;
  }

  return <DistrictMap {...props} />;
}
