"use client";

import { useTranslations } from "next-intl";

const EXPORT_DATASETS = [
  {
    id: "districts",
    formats: [
      {
        label: "GeoJSON",
        path: "/api/v1/export/districts",
        filename: "lankawa-districts.geojson",
      },
      {
        label: "CSV",
        path: "/api/v1/export/districts?format=csv",
        filename: "lankawa-districts.csv",
      },
    ],
  },
  {
    id: "elections",
    formats: [
      {
        label: "JSON",
        path: "/api/v1/export/elections",
        filename: "lankawa-elections.json",
      },
      {
        label: "CSV",
        path: "/api/v1/export/elections?format=csv",
        filename: "lankawa-elections.csv",
      },
    ],
  },
  {
    id: "services",
    formats: [
      {
        label: "JSON",
        path: "/api/v1/export/services",
        filename: "lankawa-services.json",
      },
      {
        label: "CSV",
        path: "/api/v1/export/services?format=csv",
        filename: "lankawa-services.csv",
      },
    ],
  },
  {
    id: "fuelHistory",
    formats: [
      {
        label: "JSON",
        path: "/api/v1/export/fuel-history",
        filename: "lankawa-fuel-history.json",
      },
      {
        label: "CSV",
        path: "/api/v1/export/fuel-history?format=csv",
        filename: "lankawa-fuel-history.csv",
      },
    ],
  },
] as const;

export function DataExportPanel() {
  const t = useTranslations("developers");

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-semibold text-white">{t("exportTitle")}</h2>
      <p className="mt-2 text-slate-300">{t("exportBody")}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {EXPORT_DATASETS.map((dataset) => (
          <article
            key={dataset.id}
            className="rounded-xl border border-white/10 bg-slate-950/40 p-4"
          >
            <p className="font-medium text-white">{t(`export_${dataset.id}`)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {dataset.formats.map((format) => (
                <a
                  key={format.path}
                  href={format.path}
                  download={format.filename}
                  className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/10"
                >
                  {t("exportDownload")} {format.label}
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
