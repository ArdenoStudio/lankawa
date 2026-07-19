"use client";

import dynamic from "next/dynamic";
import { DataSaverMapFallback } from "@/components/DataSaverMapFallback";
import { useDataSaver } from "@/components/DataSaverProvider";

const TransportMap = dynamic(
  () => import("@/components/TransportMap").then((mod) => mod.TransportMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 text-sm text-slate-400">
        Loading map…
      </div>
    ),
  },
);

export function TransportMapLazy() {
  const { enabled, hydrated } = useDataSaver();

  if (!hydrated) {
    return <DataSaverMapFallback height={320} pending />;
  }

  if (enabled) {
    return <DataSaverMapFallback height={320} />;
  }

  return <TransportMap />;
}
