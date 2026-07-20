"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getDistrict } from "@/lib/districts";
import {
  HOME_DISTRICT_EVENT,
  readHomeDistrict,
} from "@/lib/preferences";

const SERVICES_CACHE_MESSAGE = "lankawa:cache-home-services";

function requestServicesCache(slug: string) {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }
  navigator.serviceWorker.ready
    .then((registration) => {
      registration.active?.postMessage({
        type: SERVICES_CACHE_MESSAGE,
        districtSlug: slug,
      });
    })
    .catch(() => undefined);
}

export function OfflineMorningShell() {
  const t = useTranslations("pwa");
  const [offline, setOffline] = useState(false);
  const [homeSlug, setHomeSlug] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return readHomeDistrict(window.localStorage);
  });

  useEffect(() => {
    const updateOnline = () => setOffline(!navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);

    const syncHome = () => {
      const slug = readHomeDistrict(window.localStorage);
      setHomeSlug(slug);
      if (slug) {
        requestServicesCache(slug);
      }
    };
    if (homeSlug) {
      requestServicesCache(homeSlug);
    }
    window.addEventListener(HOME_DISTRICT_EVENT, syncHome);

    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
      window.removeEventListener(HOME_DISTRICT_EVENT, syncHome);
    };
    // Intentionally mount-only for listeners; homeSlug seed is from lazy state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!offline) {
    return null;
  }

  const district = homeSlug ? getDistrict(homeSlug) : null;

  return (
    <aside
      className="rounded-2xl border border-white/20 bg-white/[0.06] px-4 py-3 text-sm text-neutral-200"
      role="status"
    >
      <p className="font-medium text-white">{t("offlineTitle")}</p>
      <p className="mt-1 text-neutral-400">{t("offlineBody")}</p>
      {district ? (
        <p className="mt-2 text-neutral-300">
          {t("offlineServicesHint", { district: district.name })}{" "}
          <Link
            href={`/services?district=${district.slug}`}
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {t("offlineServicesLink")}
          </Link>
        </p>
      ) : (
        <p className="mt-2 text-neutral-500">{t("offlineServicesPinHint")}</p>
      )}
    </aside>
  );
}
