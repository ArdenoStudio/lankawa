"use client";

import dynamic from "next/dynamic";
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
  return <DistrictMap {...props} />;
}
