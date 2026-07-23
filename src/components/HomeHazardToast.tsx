"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DISTRICT_COORDS } from "@/lib/district-coords";
import { getDistrict, getDistrictName } from "@/lib/districts";
import { readHomeDistrict } from "@/lib/preferences";

export interface HomeHazardFirePin {
  id: string;
  latitude: number;
  longitude: number;
}

export interface HomeHazardLandslideRow {
  slug: string;
  tier: "none" | "watch" | "warning" | "unknown";
}

const FIRE_RADIUS_KM = 45;
const DISMISS_KEY = "lankawa_home_hazard_dismissed";

function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export function HomeHazardToast({
  locale,
  fires,
  landslides,
  floodElevatedDistricts = [],
}: {
  locale: string;
  fires: HomeHazardFirePin[];
  landslides: HomeHazardLandslideRow[];
  /** District slugs with elevated (non-NORMAL) flood station attention. */
  floodElevatedDistricts?: string[];
}) {
  const t = useTranslations("homeHazard");
  const [slug] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return readHomeDistrict(window.localStorage);
  });
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    const home = readHomeDistrict(window.localStorage);
    const day = new Date().toISOString().slice(0, 10);
    return (
      window.localStorage.getItem(DISMISS_KEY) === `${home ?? ""}:${day}`
    );
  });

  const attention = useMemo(() => {
    if (!slug) {
      return null;
    }

    const district = getDistrict(slug);
    if (!district) {
      return null;
    }

    const landslide = landslides.find(
      (row) =>
        row.slug === slug && (row.tier === "watch" || row.tier === "warning"),
    );

    const floodElevated = floodElevatedDistricts.includes(slug);

    const coords = DISTRICT_COORDS[slug];
    const nearbyFires = coords
      ? fires.filter(
          (fire) =>
            haversineKm(coords, {
              latitude: fire.latitude,
              longitude: fire.longitude,
            }) <= FIRE_RADIUS_KM,
        )
      : [];

    if (!landslide && nearbyFires.length === 0 && !floodElevated) {
      return null;
    }

    return {
      district,
      landslideTier: landslide?.tier ?? null,
      floodElevated,
      fireCount: nearbyFires.length,
    };
  }, [slug, fires, landslides, floodElevatedDistricts]);

  if (!attention || dismissed) {
    return null;
  }

  const name = getDistrictName(attention.district, locale);

  function handleDismiss() {
    const day = new Date().toISOString().slice(0, 10);
    window.localStorage.setItem(DISMISS_KEY, `${slug ?? ""}:${day}`);
    setDismissed(true);
  }

  return (
    <aside
      role="status"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-white/20 bg-black/90 p-4 shadow-lg backdrop-blur sm:left-auto"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("eyebrow")}
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            {t("title", { district: name })}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            {attention.landslideTier ? (
              <li>
                {t("landslide", {
                  tier: attention.landslideTier,
                })}
              </li>
            ) : null}
            {attention.floodElevated ? <li>{t("flood")}</li> : null}
            {attention.fireCount > 0 ? (
              <li>{t("fires", { count: attention.fireCount })}</li>
            ) : null}
          </ul>
          <p className="mt-2 text-xs text-slate-500">{t("honesty")}</p>
          <Link
            href="/disaster"
            className="mt-3 inline-block text-sm text-teal-300 hover:text-teal-200"
          >
            {t("openDisaster")}
          </Link>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-full border border-white/20 px-2 py-1 text-xs text-slate-400 hover:text-white"
          aria-label={t("dismiss")}
        >
          {t("dismiss")}
        </button>
      </div>
    </aside>
  );
}
