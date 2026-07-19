"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRouter } from "@/i18n/navigation";
import { districtSlugFromName, districtSlugFromPcode } from "@/lib/district-geo";

interface DistrictFeatureProperties {
  slug?: string;
  ADM2_EN?: string;
  ADM2_PCODE?: string;
}

interface DistrictFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: DistrictFeatureProperties;
    geometry: GeoJSON.Geometry;
  }>;
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

export function DistrictMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
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
                paint: {
                  "fill-color": "#14b8a6",
                  "fill-opacity": [
                    "case",
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
                  "line-color": "#5eead4",
                  "line-width": 1,
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
        });

        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
        mapRef.current = map;

        let hoveredId: string | number | undefined;

        map.on("mousemove", "district-fill", (event) => {
          map.getCanvas().style.cursor = "pointer";
          if (event.features?.length) {
            const featureId = event.features[0].id;
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
          }
        });

        map.on("mouseleave", "district-fill", () => {
          map.getCanvas().style.cursor = "";
          if (hoveredId != null) {
            map.setFeatureState(
              { source: "districts", id: hoveredId },
              { hover: false },
            );
          }
          hoveredId = undefined;
        });

        map.on("click", "district-fill", (event) => {
          const properties = event.features?.[0]?.properties as
            | DistrictFeatureProperties
            | undefined;
          const slug = properties ? resolveSlug(properties) : null;
          if (slug) {
            router.push(`/districts/${slug}`);
          }
        });
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
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [router]);

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-6 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
      <div ref={containerRef} className="h-[420px] w-full" />
    </div>
  );
}
