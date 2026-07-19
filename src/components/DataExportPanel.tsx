"use client";

import { useTranslations } from "next-intl";

const EXPORT_DATASETS = [
  {
    id: "districts",
    path: "/api/v1/export/districts",
    filename: "lankawa-districts.geojson",
    format: "GeoJSON",
  },
  {
    id: "elections",
    path: "/api/v1/export/elections",
    filename: "lankawa-elections.json",
    format: "JSON",
  },
  {
    id: "services",
    path: "/api/v1/export/services",
    filename: "lankawa-services.json",
    format: "JSON",
  },
] as const;

export function DataExportPanel() {
  const t = useTranslations("developers");

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-semibold text-white">{t("exportTitle")}</h2>
      <p className="mt-2 text-slate-300">{t("exportBody")}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {EXPORT_DATASETS.map((dataset) => (
          <article
            key={dataset.id}
            className="rounded-xl border border-white/10 bg-slate-950/40 p-4"
          >
            <p className="font-medium text-white">{t(`export_${dataset.id}`)}</p>
            <p className="mt-1 text-xs text-slate-500">{dataset.format}</p>
            <a
              href={dataset.path}
              download={dataset.filename}
              className="mt-4 inline-flex rounded-full bg-teal-500/20 px-4 py-2 text-sm text-teal-200 transition hover:bg-teal-500/30"
            >
              {t("exportDownload")}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
