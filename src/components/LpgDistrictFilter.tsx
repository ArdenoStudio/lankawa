"use client";

import { useMemo, useState } from "react";
import type { LpgCylinderPrice } from "@/lib/integrations/lpg";

export function LpgDistrictFilter({
  prices,
  locale,
  preferredDistrict,
  labels,
}: {
  prices: LpgCylinderPrice[];
  locale: string;
  preferredDistrict?: string | null;
  labels: {
    filterLabel: string;
    allDistricts: string;
    cylinder12_5: string;
    empty: string;
  };
}) {
  const districts = useMemo(() => {
    const names = new Set(
      prices
        .filter((price) => price.cylinderKg === 12.5)
        .map((price) => price.district),
    );
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [prices]);

  const defaultDistrict = (() => {
    if (
      preferredDistrict &&
      districts.some(
        (district) =>
          district.toLowerCase() === preferredDistrict.toLowerCase(),
      )
    ) {
      return (
        districts.find(
          (district) =>
            district.toLowerCase() === preferredDistrict.toLowerCase(),
        ) ?? "Colombo"
      );
    }
    return districts.includes("Colombo") ? "Colombo" : (districts[0] ?? "");
  })();

  const [district, setDistrict] = useState(defaultDistrict);

  const filtered = prices
    .filter(
      (price) =>
        price.cylinderKg === 12.5 &&
        (!district ||
          price.district.toLowerCase() === district.toLowerCase()),
    )
    .sort((a, b) => a.provider.localeCompare(b.provider));

  if (districts.length === 0) {
    return <p className="text-sm text-slate-500">{labels.empty}</p>;
  }

  return (
    <div className="space-y-3">
      <label className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span>{labels.filterLabel}</span>
        <select
          value={district}
          onChange={(event) => setDistrict(event.target.value)}
          className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm text-white"
        >
          {districts.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">{labels.empty}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((price) => (
            <div
              key={`${price.provider}-${price.district}-${price.cylinderKg}`}
              className="rounded-xl border border-white/10 bg-black/15 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    {price.provider}
                  </p>
                  <p className="text-xs text-slate-500">
                    {price.district} · {labels.cylinder12_5}
                  </p>
                </div>
                <p className="text-xl font-semibold text-white">
                  {price.priceLkr.toLocaleString(locale, {
                    maximumFractionDigits: 0,
                  })}
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    LKR
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
