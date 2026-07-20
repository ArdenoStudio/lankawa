"use client";

import { useTranslations } from "next-intl";

const WIDGETS = [
  { id: "today", path: "/embed/today", height: 260 },
  { id: "pulse", path: "/embed/pulse", height: 220 },
  { id: "fuel", path: "/embed/fuel", height: 120 },
  { id: "fx", path: "/embed/fx", height: 120 },
  { id: "cse", path: "/embed/cse", height: 200 },
  { id: "brief", path: "/embed/brief", height: 280 },
] as const;

export function EmbedPreview() {
  const t = useTranslations("embed");

  return (
    <div className="space-y-8">
      {WIDGETS.map((widget) => (
        <section
          key={widget.id}
          className="rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <h2 className="text-lg font-semibold text-white">
            {t(`widget_${widget.id}`)}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{t(`widget_${widget.id}Desc`)}</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <iframe
              title={t(`widget_${widget.id}`)}
              src={widget.path}
              className="w-full bg-slate-950"
              style={{ height: widget.height }}
              loading="lazy"
            />
          </div>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950/80 p-4 text-xs text-slate-300">
            {`<iframe src="${widget.path}" width="100%" height="${widget.height}" title="${t(`widget_${widget.id}`)}"></iframe>`}
          </pre>
        </section>
      ))}
    </div>
  );
}
