"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function OfflineMorningShell() {
  const t = useTranslations("pwa");
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) {
    return null;
  }

  return (
    <aside
      className="rounded-2xl border border-white/20 bg-white/[0.06] px-4 py-3 text-sm text-slate-200"
      role="status"
    >
      <p className="font-medium text-white">{t("offlineTitle")}</p>
      <p className="mt-1 text-slate-400">{t("offlineBody")}</p>
    </aside>
  );
}
