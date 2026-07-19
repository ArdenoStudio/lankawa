"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { getMajorRailwayStations } from "@/lib/transport";

export function TransportMap() {
  const t = useTranslations("transport");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    let map: import("maplibre-gl").Map | null = null;
    let cancelled = false;

    async function init() {
      const maplibregl = await import("maplibre-gl");
      await import("maplibre-gl/dist/maplibre-gl.css");

      if (cancelled || !containerRef.current) {
        return;
      }

      map = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap",
            },
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
            },
          ],
        },
        center: [80.5, 7.8],
        zoom: 6.5,
      });

      map.addControl(new maplibregl.NavigationControl(), "top-right");

      for (const station of getMajorRailwayStations()) {
        new maplibregl.Marker({ color: "#14b8a6" })
          .setLngLat([station.lng, station.lat])
          .setPopup(new maplibregl.Popup().setText(station.name))
          .addTo(map);
      }
    }

    init().catch(() => {
      // Map is optional enhancement.
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="h-[320px] overflow-hidden rounded-2xl border border-white/10"
      />
      <p className="text-xs text-slate-500">{t("mapCaption")}</p>
    </div>
  );
}
