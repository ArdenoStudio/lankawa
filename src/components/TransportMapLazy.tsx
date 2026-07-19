"use client";

import dynamic from "next/dynamic";

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
  return <TransportMap />;
}
