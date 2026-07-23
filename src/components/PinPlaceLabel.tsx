"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { formatApproxPlace } from "@/lib/integrations/nominatim";

type PlaceResponse = {
  approx?: string;
  place?: { displayName: string } | null;
  error?: string;
};

/**
 * Lazy reverse label for a single expanded/clicked pin.
 * Fetches once — do not mount in list loops without user expand.
 * Remount with a new key when lat/lon change so state resets cleanly.
 */
export function PinPlaceLabel({
  lat,
  lon,
  active = true,
}: {
  lat: number;
  lon: number;
  /** When false, only show approx coords (no Nominatim call). */
  active?: boolean;
}) {
  const t = useTranslations("disaster");
  const approx = formatApproxPlace(lat, lon);
  const [label, setLabel] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }
    let cancelled = false;

    void (async () => {
      try {
        const params = new URLSearchParams({
          lat: String(lat),
          lon: String(lon),
        });
        const response = await fetch(`/api/v1/geocode/reverse?${params}`);
        const data = (await response.json()) as PlaceResponse;
        if (cancelled) {
          return;
        }
        if (response.ok && data.place?.displayName) {
          setLabel(data.place.displayName);
          return;
        }
        setFailed(true);
      } catch {
        if (!cancelled) {
          setFailed(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active, lat, lon]);

  if (!active) {
    return <span className="text-xs text-slate-500">{approx}</span>;
  }

  if (label) {
    return (
      <span className="text-xs text-slate-300" title={approx}>
        {label}
      </span>
    );
  }

  if (failed) {
    return (
      <span className="text-xs text-slate-500">
        {approx} · {t("pinPlaceUnavailable")}
      </span>
    );
  }

  return (
    <span className="text-xs text-slate-500">
      {approx} · {t("pinPlaceLoading")}
    </span>
  );
}
