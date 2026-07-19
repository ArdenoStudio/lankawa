"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { daysBetween } from "@/lib/analytics";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function habitAllowsInstall(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const firstSeen = window.localStorage.getItem("lankawa_first_seen");
  if (!firstSeen) {
    return false;
  }
  return daysBetween(firstSeen) >= 1;
}

export function InstallPrompt() {
  const t = useTranslations("pwa");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return localStorage.getItem("lankawa-pwa-dismissed") === "1";
  });
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(habitAllowsInstall());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || dismissed || !allowed) {
      return;
    }

    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [dismissed, allowed]);

  if (dismissed || !deferred || !allowed) {
    return null;
  }

  async function handleInstall() {
    await deferred?.prompt();
    setDeferred(null);
  }

  function handleDismiss() {
    localStorage.setItem("lankawa-pwa-dismissed", "1");
    setDismissed(true);
    setDeferred(null);
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-white/20 bg-black/95 p-4 shadow-xl backdrop-blur sm:left-auto">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">{t("installTitle")}</p>
          <p className="mt-1 text-xs text-neutral-400">{t("installBody")}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleInstall}
              className="lk-btn-primary px-4 py-1.5 text-sm"
            >
              {t("installAction")}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-full px-4 py-1.5 text-sm text-neutral-400 hover:bg-white/5"
            >
              {t("installDismiss")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
