"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ALERT_PIN_IDS,
  evaluateAlertPins,
  type AlertPinId,
  type AlertSignalContext,
} from "@/lib/alert-pins";
import { readAlertPins, writeAlertPins } from "@/lib/preferences";

const PIN_HREF: Record<AlertPinId, string> = {
  fx_move: "/economy",
  flood: "/disaster",
  power: "/disaster",
  met: "/disaster",
  landslide: "/disaster",
};

export function AlertPins({ context }: { context: AlertSignalContext }) {
  const t = useTranslations("alertPins");
  const [pins, setPins] = useState<AlertPinId[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    return readAlertPins(window.localStorage);
  });

  const fired = useMemo(
    () => evaluateAlertPins(pins, context),
    [pins, context],
  );

  function toggle(pin: AlertPinId) {
    const next = pins.includes(pin)
      ? pins.filter((item) => item !== pin)
      : [...pins, pin];
    writeAlertPins(window.localStorage, next);
    setPins(next);
  }

  return (
    <section className="space-y-3">
      {fired.length > 0 ? (
        <div
          className="rounded-2xl border border-white/25 bg-white/[0.06] p-4"
          role="status"
          aria-live="polite"
        >
          <h2 className="font-display text-lg font-semibold text-white">
            {t("firedTitle")}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">{t("firedSubtitle")}</p>
          <ul className="mt-3 space-y-2">
            {fired.map((alert) => (
              <li key={alert.id}>
                <Link
                  href={PIN_HREF[alert.id]}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm transition hover:border-white/35"
                >
                  <span className="font-medium text-white">
                    {t(`pin_${alert.id}`)}
                  </span>
                  <span className="text-neutral-400">{alert.detail}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">{t("subtitle")}</p>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {ALERT_PIN_IDS.map((pin) => {
            const checked = pins.includes(pin);
            return (
              <li key={pin}>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm transition hover:border-white/25">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(pin)}
                    className="mt-0.5 h-4 w-4 accent-white"
                  />
                  <span>
                    <span className="block font-medium text-white">
                      {t(`pin_${pin}`)}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500">
                      {t(`help_${pin}`, {
                        threshold: context.fxThresholdLkr,
                      })}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-neutral-500">{t("privacy")}</p>
      </div>
    </section>
  );
}
