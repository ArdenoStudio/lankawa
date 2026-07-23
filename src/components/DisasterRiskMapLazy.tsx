"use client";

import dynamic from "next/dynamic";
import { DataSaverMapFallback } from "@/components/DataSaverMapFallback";
import { useDataSaver } from "@/components/DataSaverProvider";
import type { DisasterRiskMapProps } from "@/components/DisasterRiskMap";

const DisasterRiskMap = dynamic(
  () =>
    import("@/components/DisasterRiskMap").then((mod) => mod.DisasterRiskMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[380px] items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 text-sm text-slate-400">
        Loading map…
      </div>
    ),
  },
);

export function DisasterRiskMapLazy(props: DisasterRiskMapProps) {
  const { enabled, hydrated } = useDataSaver();
  const height = props.height ?? 380;

  if (!hydrated) {
    return <DataSaverMapFallback height={height} pending />;
  }

  if (enabled) {
    return <DataSaverMapFallback height={height} />;
  }

  return <DisasterRiskMap {...props} />;
}
