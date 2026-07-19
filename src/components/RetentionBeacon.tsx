"use client";

import { useEffect } from "react";
import {
  markReturnEvent,
  readBrowserRetentionState,
  resolveReturnEvent,
  type RetentionEventName,
} from "@/lib/analytics";

async function postEvent(
  name: RetentionEventName,
  locale: string,
  path: string,
) {
  try {
    await fetch("/api/v1/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        at: new Date().toISOString(),
        locale,
        path,
      }),
      keepalive: true,
    });
  } catch {
    // Non-blocking
  }
}

export function RetentionBeacon({ locale }: { locale: string }) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const path = window.location.pathname;
    void postEvent("home_view", locale, path);

    const { firstSeen, lastReturnEvent } = readBrowserRetentionState(
      window.localStorage,
    );
    const returnEvent = resolveReturnEvent(firstSeen);
    if (returnEvent && returnEvent !== lastReturnEvent) {
      markReturnEvent(window.localStorage, returnEvent);
      void postEvent(returnEvent, locale, path);
    }
  }, [locale]);

  return null;
}
