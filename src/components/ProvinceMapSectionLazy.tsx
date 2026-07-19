"use client";

import dynamic from "next/dynamic";
import { DataSaverMapFallback } from "@/components/DataSaverMapFallback";
import { useDataSaver } from "@/components/DataSaverProvider";

const ProvinceMapSectionDynamic = dynamic(
  () =>
    import("@/components/ProvinceMapSection").then(
      (mod) => mod.ProvinceMapSection,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 text-sm text-slate-400">
        Loading map…
      </div>
    ),
  },
);

export function ProvinceMapSection({
  provinceDistrictSlugs,
}: {
  provinceDistrictSlugs?: string[];
}) {
  const { enabled, hydrated } = useDataSaver();

  if (!hydrated) {
    return <DataSaverMapFallback height={360} pending />;
  }

  if (enabled) {
    return <DataSaverMapFallback height={360} />;
  }

  return (
    <ProvinceMapSectionDynamic provinceDistrictSlugs={provinceDistrictSlugs} />
  );
}
