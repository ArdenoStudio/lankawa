"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTranslations } from "next-intl";
import { districtSlugFromName, districtSlugFromPcode } from "@/lib/district-geo";
import type { LandslideDistrictStatus } from "@/lib/integrations/landslide";
import type { FloodAlertSummary } from "@/lib/types";

type MapMode = "flood" | "landslide";

interface DistrictFeatureProperties {
  slug?: string;
  ADM2_EN?: string;
  ADM2_PCODE?: string;
  fillOpacity?: number;
  hatch?: string;
  tooltipValue?: string;
}

function resolveSlug(properties: DistrictFeatureProperties): string | null {
  if (properties.slug) {
    return properties.slug;
  }
  return (
    districtSlugFromPcode(properties.ADM2_PCODE) ??
    districtSlugFromName(properties.ADM2_EN)
  );
}

function landslideOpacity(tier: string): number {
  if (tier === "warning") return 0.75;
  if (tier === "watch") return 0.45;
  return 0.08;
}

export function DisasterRiskMap({
  flood,
  landslideDistricts,
  height = 380,
}: {
  flood: FloodAlertSummary[];
  landslideDistricts: LandslideDistrictStatus[];
  height?: number;
}) {
  const t = useTranslations("disaster");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mode, setMode] = useState<MapMode>("landslide");
  const [error, setError] = useState<string | null>(null);

  const landslideBySlug = useMemo(() => {
    const map = new Map<string, LandslideDistrictStatus>();
    for (const row of landslideDistricts) {
      map.set(row.slug, row);
    }
    return map;
  }, [landslideDistricts]);

  const floodActive = useMemo(
    () => flood.some((row) => row.count > 0 && row.alertLevel.toUpperCase() !== "NORMAL"),
    [flood],
  );

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    let cancelled = false;

    async function initMap() {
      try {
        const response = await fetch("/geo/districts.geojson");
        if (!response.ok) {
          throw new Error(`GeoJSON HTTP ${response.status}`);
        }
        const geojson = (await response.json()) as GeoJSON.FeatureCollection;

        if (cancelled || !containerRef.current) {
          return;
        }

        mapRef.current?.remove();
        const map = new maplibregl.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {},
            layers: [
              {
                id: "background",
                type: "background",
                paint: { "background-color": "#0a0a0a" },
              },
            ],
          },
          center: [80.7, 7.9],
          zoom: 6.4,
          attributionControl: false,
        });
        mapRef.current = map;

        map.on("load", () => {
          const features = geojson.features.map((feature) => {
            const properties = (feature.properties ??
              {}) as DistrictFeatureProperties;
            const slug = resolveSlug(properties);
            let fillOpacity = 0.08;
            let tooltipValue = "—";

            if (mode === "landslide" && slug) {
              const row = landslideBySlug.get(slug);
              const tier = row?.tier ?? "none";
              fillOpacity = landslideOpacity(tier);
              tooltipValue = tier;
            } else if (mode === "flood") {
              fillOpacity = floodActive ? 0.2 : 0.08;
              tooltipValue = floodActive ? "elevated national flood context" : "quiet";
            }

            return {
              ...feature,
              properties: {
                ...properties,
                slug,
                fillOpacity,
                tooltipValue,
              },
            };
          });

          map.addSource("districts", {
            type: "geojson",
            data: { type: "FeatureCollection", features },
          });

          map.addLayer({
            id: "district-fill",
            type: "fill",
            source: "districts",
            paint: {
              "fill-color": "#ffffff",
              "fill-opacity": ["get", "fillOpacity"],
            },
          });

          map.addLayer({
            id: "district-line",
            type: "line",
            source: "districts",
            paint: {
              "line-color": "#ffffff",
              "line-opacity": 0.35,
              "line-width": 0.8,
            },
          });
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t("mapError"));
        }
      }
    }

    void initMap();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [floodActive, landslideBySlug, mode, t]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{t("mapTitle")}</h2>
          <p className="mt-1 text-sm text-slate-400">{t("mapSubtitle")}</p>
        </div>
        <div
          className="inline-flex rounded-full border border-white/15 p-0.5"
          role="group"
          aria-label={t("mapToggleLabel")}
        >
          {(["flood", "landslide"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={
                mode === item
                  ? "rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black"
                  : "rounded-full px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white"
              }
            >
              {t(`mapMode_${item}`)}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-neutral-400">{t("mapError")}</p>
      ) : (
        <div
          ref={containerRef}
          className="overflow-hidden rounded-2xl border border-white/15"
          style={{ height }}
        />
      )}

      <p className="text-xs text-neutral-500">
        {mode === "landslide" ? t("mapLegendLandslide") : t("mapLegendFlood")}
      </p>
    </section>
  );
}
