"use client";

import { useRouter } from "@/i18n/navigation";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function CompareDistrictPicker({
  selected,
  locale,
}: {
  selected: string[];
  locale: string;
}) {
  const t = useTranslations("compare");
  const router = useRouter();
  const [first, setFirst] = useState(selected[0] ?? "colombo");
  const [second, setSecond] = useState(selected[1] ?? "kandy");

  function handleCompare() {
    router.push(`/compare?districts=${first},${second}`);
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">{t("districtA")}</span>
          <select
            value={first}
            onChange={(event) => setFirst(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
          >
            {DISTRICTS.map((district) => (
              <option key={district.slug} value={district.slug}>
                {getDistrictName(district, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">{t("districtB")}</span>
          <select
            value={second}
            onChange={(event) => setSecond(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
          >
            {DISTRICTS.map((district) => (
              <option key={district.slug} value={district.slug}>
                {getDistrictName(district, locale)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={handleCompare}
          className="rounded-full bg-teal-500/20 px-5 py-2 text-sm font-medium text-teal-100 hover:bg-teal-500/30"
        >
          {t("compareAction")}
        </button>
      </div>
      <p className="text-xs text-slate-500">{t("pickerHint")}</p>
    </div>
  );
}
