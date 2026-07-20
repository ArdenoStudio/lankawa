"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  DEFAULT_WEB_PUSH_PREFS,
  isInQuietHours,
  readWebPushPrefs,
  writeWebPushPrefs,
  type WebPushPrefs,
} from "@/lib/web-push-prefs";

function initialPrefs(): WebPushPrefs {
  if (typeof window === "undefined") {
    return DEFAULT_WEB_PUSH_PREFS;
  }
  return readWebPushPrefs(window.localStorage);
}

function initialPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined") {
    return "default";
  }
  if (!("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/** P53 — Web Push opt-in scaffold (permission UI + quiet hours). No push server. */
export function WebPushOptIn() {
  const t = useTranslations("webPush");
  const [prefs, setPrefs] = useState<WebPushPrefs>(initialPrefs);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >(initialPermission);
  const [status, setStatus] = useState<string | null>(null);

  const quietNow =
    prefs.quietHoursEnabled &&
    isInQuietHours(
      new Date().getHours(),
      prefs.quietStartHour,
      prefs.quietEndHour,
    );

  async function requestPermission() {
    if (!("Notification" in window)) {
      setStatus(t("unsupported"));
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      const next: WebPushPrefs = {
        ...prefs,
        permissionAskedAt: new Date().toISOString(),
      };
      writeWebPushPrefs(window.localStorage, next);
      setPrefs(next);
      if (result === "granted") {
        setStatus(t("granted"));
      } else if (result === "denied") {
        setStatus(t("denied"));
      } else {
        setStatus(t("dismissed"));
      }
    } catch {
      setStatus(t("error"));
    }
  }

  function toggleQuietHours() {
    const next: WebPushPrefs = {
      ...prefs,
      quietHoursEnabled: !prefs.quietHoursEnabled,
    };
    writeWebPushPrefs(window.localStorage, next);
    setPrefs(next);
  }

  return (
    <section className="space-y-3 rounded-2xl border border-white/15 bg-white/[0.03] p-4">
      <div>
        <h2 className="text-sm font-semibold text-white">{t("title")}</h2>
        <p className="mt-1 text-xs text-neutral-400">{t("subtitle")}</p>
      </div>

      <p className="text-xs text-neutral-500">
        {t("permissionLabel")}:{" "}
        <span className="text-neutral-300">
          {permission === "unsupported"
            ? t("unsupportedShort")
            : t(`permission_${permission}`)}
        </span>
      </p>

      {permission !== "granted" && permission !== "unsupported" ? (
        <button
          type="button"
          onClick={() => void requestPermission()}
          className="rounded-full border border-white/20 bg-white px-4 py-1.5 text-xs font-medium text-black hover:bg-neutral-200"
        >
          {t("enable")}
        </button>
      ) : null}

      <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-300">
        <input
          type="checkbox"
          checked={prefs.quietHoursEnabled}
          onChange={toggleQuietHours}
          className="accent-white"
        />
        {t("quietHours", {
          start: prefs.quietStartHour,
          end: prefs.quietEndHour,
        })}
      </label>

      {quietNow ? (
        <p className="text-xs text-neutral-500">{t("quietActive")}</p>
      ) : null}

      {status ? <p className="text-xs text-neutral-400">{status}</p> : null}

      <p className="text-xs text-neutral-500">{t("honesty")}</p>
    </section>
  );
}
