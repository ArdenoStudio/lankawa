"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { readHomeDistrict, writeHomeDistrict } from "@/lib/preferences";

export function DistrictPinButton({ slug }: { slug: string }) {
  const t = useTranslations("homeDistrict");
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    setPinned(readHomeDistrict(window.localStorage) === slug);
  }, [slug]);

  function toggle() {
    if (pinned) {
      writeHomeDistrict(window.localStorage, null);
      setPinned(false);
      return;
    }
    writeHomeDistrict(window.localStorage, slug);
    setPinned(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={
        pinned
          ? "lk-btn-primary px-3 py-1.5 text-xs"
          : "lk-btn-secondary px-3 py-1.5 text-xs"
      }
    >
      {pinned ? t("unpin") : t("pin")}
    </button>
  );
}
