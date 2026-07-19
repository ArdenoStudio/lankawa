"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRouter } from "@/i18n/navigation";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import { districtSlugFromName, districtSlugFromPcode } from "@/lib/district-geo";
import { getCandidateColor } from "@/lib/elections";
import type { ElectionCandidateId } from "@/lib/types";

interface DistrictFeatureProperties {
  slug?: string;
  ADM2_EN?: string;
  ADM2_PCODE?: string;
  winnerColor?: string;
}

interface DistrictFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: DistrictFeatureProperties;
    geometry: GeoJSON.Geometry;
  }>;
}

export interface DistrictMapProps {
  locale?: string;
  highlightSlug?: string;
  height?: number;
  interactive?: boolean;
  winnerBySlug?: Record<string, ElectionCandidateId>;
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

function districtLabel(slug: string, locale: string): string {
  const district = DISTRICTS.find((item) => item.slug === slug);
  if (!district) {
    return slug;
  }
  return getDistrictName(district, locale);
}

export function DistrictMap({
  locale = "en",
  highlightSlug,
  height = 420,
  interactive = true,
  winnerBySlug,
}: DistrictMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    let cancelled = false;

    async function initMap() {
      try {
        const response = await fetch("/geo/districts.geojson");
        if (!response.ok) {
          throw new Error("Failed to load district boundaries");
        }
        const geojson = (await response.json()) as DistrictFeatureCollection;

        if (cancelled || !containerRef.current) {
          return;
        }

        const useWinnerColors = Boolean(winnerBySlug);

        if (useWinnerColors && winnerBySlug) {
          for (const feature of geojson.features) {
            const slug = resolveSlug(feature.properties);
            feature.properties.winnerColor =
              slug && winnerBySlug[slug]
                ? getCandidateColor(winnerBySlug[slug])
                : "#334155";
          }
        }

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {
              districts: {
                type: "geojson",
                data: geojson,
                promoteId: "slug",
              },
            },
            layers: [
              {
                id: "district-fill",
                type: "fill",
                source: "districts",
                paint: useWinnerColors
                  ? {
                      "fill-color": ["get", "winnerColor"],
                      "fill-opacity": [
                        "case",
                        ["boolean", ["feature-state", "selected"], false],
                        0.75,
                        ["boolean", ["feature-state", "hover"], false],
                        0.55,
                        0.35,
                      ],
                    }
                  : {
                      "fill-color": "#14b8a6",
                      "fill-opacity": [
                        "case",
                        ["boolean", ["feature-state", "selected"], false],
                        0.65,
                        ["boolean", ["feature-state", "hover"], false],
                        0.45,
                        0.22,
                      ],
                    },
              },
              {
                id: "district-outline",
                type: "line",
                source: "districts",
                paint: {
                  "line-color": [
                    "case",
                    ["boolean", ["feature-state", "selected"], false],
                    "#fbbf24",
                    "#5eead4",
                  ],
                  "line-width": [
                    "case",
                    ["boolean", ["feature-state", "selected"], false],
                    2.5,
                    1,
                  ],
                },
              },
            ],
          },
          bounds: [
            [79.5, 5.9],
            [82.1, 9.9],
          ],
          fitBoundsOptions: { padding: 24 },
          attributionControl: false,
          interactive,
        });

        if (interactive) {
          map.addControl(
            new maplibregl.NavigationControl({ showCompass: false }),
            "top-right",
          );
        } else {
          map.scrollZoom.disable();
          map.boxZoom.disable();
          map.dragRotate.disable();
          map.dragPan.disable();
          map.keyboard.disable();
          map.doubleClickZoom.disable();
          map.touchZoomRotate.disable();
        }

        mapRef.current = map;
        popupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: "district-map-popup",
        });

        map.on("load", () => {
          if (highlightSlug) {
            map.setFeatureState(
              { source: "districts", id: highlightSlug },
              { selected: true },
            );
          }
        });

        let hoveredId: string | number | undefined;

        map.on("mousemove", "district-fill", (event) => {
          if (!interactive) {
            return;
          }
          map.getCanvas().style.cursor = "pointer";
          if (event.features?.length) {
            const feature = event.features[0];
            const featureId = feature.id;
            const properties = feature.properties as DistrictFeatureProperties;
            const slug = resolveSlug(properties);

            if (featureId == null || hoveredId === featureId) {
              return;
            }
            if (hoveredId != null) {
              map.setFeatureState(
                { source: "districts", id: hoveredId },
                { hover: false },
              );
            }
            hoveredId = featureId;
            map.setFeatureState(
              { source: "districts", id: hoveredId },
              { hover: true },
            );

            if (slug && popupRef.current) {
              popupRef.current
                .setLngLat(event.lngLat)
                .setHTML(
                  `<div class="text-sm font-medium">${districtLabel(slug, locale)}</div>`,
                )
                .addTo(map);
            }
          }
        });

        map.on("mouseleave", "district-fill", () => {
          map.getCanvas().style.cursor = "";
          popupRef.current?.remove();
          if (hoveredId != null) {
            map.setFeatureState(
              { source: "districts", id: hoveredId },
              { hover: false },
            );
          }
          hoveredId = undefined;
        });

        if (interactive) {
          map.on("click", "district-fill", (event) => {
            const properties = event.features?.[0]?.properties as
              | DistrictFeatureProperties
              | undefined;
            const slug = properties ? resolveSlug(properties) : null;
            if (slug) {
              router.push(`/districts/${slug}`);
            }
          });
        }
      } catch (initError) {
        if (!cancelled) {
          setError(
            initError instanceof Error
              ? initError.message
              : "Unable to load map",
          );
        }
      }
    }

    void initMap();

    return () => {
      cancelled = true;
      popupRef.current?.remove();
      popupRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [router, locale, highlightSlug, interactive, winnerBySlug]);

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-6 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
      <div ref={containerRef} style={{ height }} className="w-full" />
    </div>
  );
}
