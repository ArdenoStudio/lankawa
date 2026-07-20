"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "lankawa_election_night_mode";

function readElectionNightEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function ElectionNightBanner() {
  const t = useTranslations("elections");
  const [enabled, setEnabled] = useState(readElectionNightEnabled);

  function toggle() {
    setEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore storage failures
      }
      return next;
    });
  }

  return (
    <aside
      className={
        enabled
          ? "rounded-2xl border border-white/30 bg-white/[0.08] px-4 py-3"
          : "rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">
            {enabled ? t("nightMode.onTitle") : t("nightMode.offTitle")}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            {enabled ? t("nightMode.onBody") : t("nightMode.offBody")}
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10"
          aria-pressed={enabled}
        >
          {enabled ? t("nightMode.disable") : t("nightMode.enable")}
        </button>
      </div>
      {enabled ? (
        <p className="mt-2 text-xs text-neutral-500">{t("nightMode.honesty")}</p>
      ) : null}
    </aside>
  );
}
