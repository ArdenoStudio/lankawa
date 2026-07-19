"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
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

  useEffect(() => {
    if (typeof window === "undefined" || dismissed) {
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
  }, [dismissed]);

  if (dismissed || !deferred) {
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
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-teal-500/30 bg-slate-900/95 p-4 shadow-xl backdrop-blur sm:left-auto">
      <p className="text-sm font-medium text-white">{t("installTitle")}</p>
      <p className="mt-1 text-xs text-slate-400">{t("installBody")}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="rounded-full bg-teal-500/20 px-4 py-1.5 text-sm text-teal-200 hover:bg-teal-500/30"
        >
          {t("installAction")}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full px-4 py-1.5 text-sm text-slate-400 hover:bg-white/5"
        >
          {t("installDismiss")}
        </button>
      </div>
    </div>
  );
}
