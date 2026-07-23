"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  DISASTER_MAP_LAYER_IDS,
  DISASTER_MAP_PRESETS,
  serializeDisasterMapLayers,
  type DisasterMapLayerId,
} from "@/lib/disaster-map-layers";
import { districtSlugFromName, districtSlugFromPcode } from "@/lib/district-geo";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import {
  floodAttentionByDistrict,
  floodDistrictOpacity,
} from "@/lib/flood-districts";
import {
  floodExtentPinsAsGeoJson,
  getFloodExtentPinsSnapshot,
} from "@/lib/flood-extent-pins";
import type { FirePin } from "@/lib/integrations/firms";
import type { GdacsEvent } from "@/lib/integrations/gdacs";
import type { IrrigationGaugeReading } from "@/lib/integrations/irrigation-gauges";
import type { LandslideDistrictStatus } from "@/lib/integrations/landslide";
import type { FloodAlertSummary } from "@/lib/types";

interface DistrictFeatureProperties {
  slug?: string;
  ADM2_EN?: string;
  ADM2_PCODE?: string;
  fillOpacity?: number;
  tooltipValue?: string;
}

export interface DisasterRiskMapProps {
  flood: FloodAlertSummary[];
  landslideDistricts: LandslideDistrictStatus[];
  firmsPins?: FirePin[];
  gdacsEvents?: GdacsEvent[];
  irrigationGauges?: IrrigationGaugeReading[];
  initialLayers?: DisasterMapLayerId[];
  locale?: string;
  height?: number;
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

function districtLabel(slug: string, locale: string): string {
  const district = DISTRICTS.find((item) => item.slug === slug);
  if (!district) {
    return slug;
  }
  return getDistrictName(district, locale);
}

function syncLayersToUrl(layers: DisasterMapLayerId[]) {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  url.searchParams.set("layers", serializeDisasterMapLayers(layers));
  url.searchParams.delete("preset");
  window.history.replaceState(window.history.state, "", url.toString());
}

function emptyPointCollection(): GeoJSON.FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

function firmsAsGeoJson(pins: FirePin[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: pins
      .filter(
        (pin) =>
          Number.isFinite(pin.latitude) && Number.isFinite(pin.longitude),
      )
      .map((pin) => ({
        type: "Feature" as const,
        properties: {
          id: pin.id,
          brightness: pin.brightness,
          confidence: pin.confidence,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [pin.longitude, pin.latitude] as [number, number],
        },
      })),
  };
}

function gdacsAsGeoJson(events: GdacsEvent[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: events
      .filter(
        (event) =>
          Number.isFinite(event.latitude) && Number.isFinite(event.longitude),
      )
      .map((event) => ({
        type: "Feature" as const,
        properties: {
          id: event.id,
          name: event.name,
          alertLevel: event.alertLevel,
          eventType: event.eventType,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [event.longitude, event.latitude] as [number, number],
        },
      })),
  };
}

function gaugesAsGeoJson(
  gauges: IrrigationGaugeReading[],
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: gauges
      .filter(
        (gauge) =>
          gauge.latitude != null &&
          gauge.longitude != null &&
          Number.isFinite(gauge.latitude) &&
          Number.isFinite(gauge.longitude),
      )
      .map((gauge) => ({
        type: "Feature" as const,
        properties: {
          gauge: gauge.gauge,
          basin: gauge.basin,
          alertStatus: gauge.alertStatus,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [gauge.longitude!, gauge.latitude!] as [number, number],
        },
      })),
  };
}

const PRESET_KEYS = Object.keys(DISASTER_MAP_PRESETS);

export function DisasterRiskMap({
  flood,
  landslideDistricts,
  firmsPins = [],
  gdacsEvents = [],
  irrigationGauges = [],
  initialLayers = ["landslide", "flood"],
  locale = "en",
  height = 380,
}: DisasterRiskMapProps) {
  const t = useTranslations("disaster");
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const baseGeoRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const [layers, setLayers] = useState<DisasterMapLayerId[]>(initialLayers);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const landslideBySlug = useMemo(() => {
    const map = new Map<string, LandslideDistrictStatus>();
    for (const row of landslideDistricts) {
      map.set(row.slug, row);
    }
    return map;
  }, [landslideDistricts]);

  const floodBySlug = useMemo(
    () => floodAttentionByDistrict(flood),
    [flood],
  );

  const gfmPins = useMemo(() => getFloodExtentPinsSnapshot(), []);

  const layerOn = useMemo(() => {
    const set = new Set(layers);
    return {
      flood: set.has("flood"),
      landslide: set.has("landslide"),
      gfm: set.has("gfm"),
      firms: set.has("firms"),
      gdacs: set.has("gdacs"),
      gauges: set.has("gauges"),
    };
  }, [layers]);

  function toggleLayer(id: DisasterMapLayerId) {
    setLayers((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      // Keep at least one choropleth or pin layer selectable; empty is allowed
      // so users can clear pins, but default re-adds if they clear everything.
      const resolved = next.length > 0 ? next : (["landslide"] as DisasterMapLayerId[]);
      syncLayersToUrl(resolved);
      return resolved;
    });
  }

  function applyPreset(key: string) {
    const preset = DISASTER_MAP_PRESETS[key];
    if (!preset) {
      return;
    }
    const next = [...preset];
    setLayers(next);
    syncLayersToUrl(next);
  }

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
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
        baseGeoRef.current = geojson;

        if (cancelled || !containerRef.current) {
          return;
        }

        const features = geojson.features.map((feature) => {
          const properties = (feature.properties ??
            {}) as DistrictFeatureProperties;
          const slug = resolveSlug(properties);
          return {
            ...feature,
            id: slug ?? undefined,
            properties: {
              ...properties,
              slug,
              fillOpacity: 0.08,
              tooltipValue: "—",
            },
          };
        });

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {
              districts: {
                type: "geojson",
                data: { type: "FeatureCollection", features },
                promoteId: "slug",
              },
              "gfm-pins": {
                type: "geojson",
                data: emptyPointCollection(),
              },
              "firms-pins": {
                type: "geojson",
                data: emptyPointCollection(),
              },
              "gdacs-pins": {
                type: "geojson",
                data: emptyPointCollection(),
              },
              "gauge-pins": {
                type: "geojson",
                data: emptyPointCollection(),
              },
            },
            layers: [
              {
                id: "background",
                type: "background",
                paint: { "background-color": "#0a0a0a" },
              },
              {
                id: "district-fill",
                type: "fill",
                source: "districts",
                paint: {
                  "fill-color": "#ffffff",
                  "fill-opacity": ["get", "fillOpacity"],
                },
              },
              {
                id: "district-line",
                type: "line",
                source: "districts",
                paint: {
                  "line-color": "#ffffff",
                  "line-opacity": 0.35,
                  "line-width": 0.8,
                },
              },
              {
                id: "gfm-pins-circle",
                type: "circle",
                source: "gfm-pins",
                layout: { visibility: "none" },
                paint: {
                  "circle-radius": [
                    "match",
                    ["get", "severity"],
                    "elevated",
                    7,
                    5,
                  ],
                  "circle-color": "#ffffff",
                  "circle-opacity": 0.9,
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#0a0a0a",
                },
              },
              {
                id: "firms-pins-circle",
                type: "circle",
                source: "firms-pins",
                layout: { visibility: "none" },
                paint: {
                  "circle-radius": 5,
                  "circle-color": "#f87171",
                  "circle-opacity": 0.85,
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#0a0a0a",
                },
              },
              {
                id: "gdacs-pins-circle",
                type: "circle",
                source: "gdacs-pins",
                layout: { visibility: "none" },
                paint: {
                  "circle-radius": 6,
                  "circle-color": "#38bdf8",
                  "circle-opacity": 0.9,
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#0a0a0a",
                },
              },
              {
                id: "gauge-pins-circle",
                type: "circle",
                source: "gauge-pins",
                layout: { visibility: "none" },
                paint: {
                  "circle-radius": 4,
                  "circle-color": "#a3e635",
                  "circle-opacity": 0.85,
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#0a0a0a",
                },
              },
            ],
          },
          center: [80.7, 7.9],
          zoom: 6.4,
          attributionControl: false,
        });

        map.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "top-right",
        );

        mapRef.current = map;
        popupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: "district-map-popup",
        });

        let hoveredId: string | number | undefined;

        map.on("mousemove", "district-fill", (event) => {
          map.getCanvas().style.cursor = "pointer";
          if (!event.features?.length) {
            return;
          }
          const feature = event.features[0];
          const featureId = feature.id;
          const properties = feature.properties as DistrictFeatureProperties;
          const slug = resolveSlug(properties);

          if (featureId == null || hoveredId === featureId) {
            if (slug && popupRef.current) {
              popupRef.current
                .setLngLat(event.lngLat)
                .setHTML(
                  `<div class="text-sm font-medium">${districtLabel(slug, locale)}</div>`,
                )
                .addTo(map);
            }
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

        map.on("click", "district-fill", (event) => {
          const properties = event.features?.[0]?.properties as
            | DistrictFeatureProperties
            | undefined;
          const slug = properties ? resolveSlug(properties) : null;
          if (slug) {
            router.push(`/districts/${slug}`);
          }
        });

        map.on("load", () => {
          if (!cancelled) {
            setMapReady(true);
          }
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
      popupRef.current?.remove();
      popupRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
    // Init once — data/layer updates happen in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update choropleth + pin sources / visibility without remounting
  useEffect(() => {
    const map = mapRef.current;
    const baseGeo = baseGeoRef.current;
    if (!map || !mapReady || !baseGeo) {
      return;
    }

    const source = map.getSource("districts") as maplibregl.GeoJSONSource | undefined;
    if (!source) {
      return;
    }

    const showFlood = layerOn.flood;
    const showLandslide = layerOn.landslide;

    const features = baseGeo.features.map((feature) => {
      const properties = (feature.properties ??
        {}) as DistrictFeatureProperties;
      const slug = resolveSlug(properties);
      let fillOpacity = 0.08;
      const tooltipParts: string[] = [];

      let floodOp = 0.08;
      let slideOp = 0.08;

      if (showFlood && slug) {
        const attention = floodBySlug.get(slug);
        floodOp = floodDistrictOpacity(attention?.maxAlertLevel);
        if (attention) {
          tooltipParts.push(
            `flood:${attention.maxAlertLevel}(${attention.stationCount})`,
          );
        }
      }

      if (showLandslide && slug) {
        const row = landslideBySlug.get(slug);
        const tier = row?.tier ?? "none";
        slideOp = landslideOpacity(tier);
        if (tier !== "none") {
          tooltipParts.push(`landslide:${tier}`);
        }
      }

      if (showFlood && showLandslide) {
        fillOpacity = Math.max(floodOp, slideOp);
      } else if (showFlood) {
        fillOpacity = floodOp;
      } else if (showLandslide) {
        fillOpacity = slideOp;
      } else {
        fillOpacity = 0.06;
      }

      return {
        ...feature,
        id: slug ?? undefined,
        properties: {
          ...properties,
          slug,
          fillOpacity,
          tooltipValue:
            tooltipParts.length > 0 ? tooltipParts.join(" · ") : "—",
        },
      };
    });

    source.setData({ type: "FeatureCollection", features });

    const gfmSource = map.getSource("gfm-pins") as maplibregl.GeoJSONSource | undefined;
    gfmSource?.setData(
      gfmPins.pins.length > 0
        ? floodExtentPinsAsGeoJson(gfmPins.pins)
        : emptyPointCollection(),
    );
    map.setLayoutProperty(
      "gfm-pins-circle",
      "visibility",
      layerOn.gfm && gfmPins.pins.length > 0 ? "visible" : "none",
    );

    const firmsSource = map.getSource("firms-pins") as
      | maplibregl.GeoJSONSource
      | undefined;
    firmsSource?.setData(
      firmsPins.length > 0 ? firmsAsGeoJson(firmsPins) : emptyPointCollection(),
    );
    map.setLayoutProperty(
      "firms-pins-circle",
      "visibility",
      layerOn.firms && firmsPins.length > 0 ? "visible" : "none",
    );

    const gdacsSource = map.getSource("gdacs-pins") as
      | maplibregl.GeoJSONSource
      | undefined;
    gdacsSource?.setData(
      gdacsEvents.length > 0
        ? gdacsAsGeoJson(gdacsEvents)
        : emptyPointCollection(),
    );
    map.setLayoutProperty(
      "gdacs-pins-circle",
      "visibility",
      layerOn.gdacs && gdacsEvents.length > 0 ? "visible" : "none",
    );

    const gaugeSource = map.getSource("gauge-pins") as
      | maplibregl.GeoJSONSource
      | undefined;
    gaugeSource?.setData(
      irrigationGauges.length > 0
        ? gaugesAsGeoJson(irrigationGauges)
        : emptyPointCollection(),
    );
    map.setLayoutProperty(
      "gauge-pins-circle",
      "visibility",
      layerOn.gauges && irrigationGauges.length > 0 ? "visible" : "none",
    );
  }, [
    floodBySlug,
    firmsPins,
    gdacsEvents,
    gfmPins.pins,
    irrigationGauges,
    landslideBySlug,
    layerOn.firms,
    layerOn.flood,
    layerOn.gauges,
    layerOn.gdacs,
    layerOn.gfm,
    layerOn.landslide,
    mapReady,
  ]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{t("mapTitle")}</h2>
          <p className="mt-1 text-sm text-slate-400">{t("mapSubtitle")}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-neutral-400">
          {t("mapPresetsLabel")}
        </span>
        {PRESET_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => applyPreset(key)}
            className="rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:border-white/30 hover:text-white"
          >
            {t(`mapPreset_${key}`)}
          </button>
        ))}
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={t("mapLayersLabel")}
      >
        <span className="self-center text-xs font-medium text-neutral-400">
          {t("mapLayersLabel")}
        </span>
        {DISASTER_MAP_LAYER_IDS.map((id) => {
          const active = layers.includes(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => toggleLayer(id)}
              className={
                active
                  ? "rounded-md bg-white px-2.5 py-1 text-xs font-medium text-black"
                  : "rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white"
              }
            >
              {t(`mapLayer_${id}`)}
            </button>
          );
        })}
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

      <p className="text-xs text-neutral-500">{t("mapLegendMulti")}</p>
      {layerOn.gfm ? (
        <p className="text-xs text-neutral-500">
          {t("mapGfmHonesty", {
            count: gfmPins.pins.length,
            date: gfmPins.asOf,
          })}
        </p>
      ) : null}
    </section>
  );
}
