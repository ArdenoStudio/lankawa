import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSourceProvenancePath } from "@/lib/sources";
import { getUrbanHeatNote } from "@/lib/urban-heat";

export async function UrbanHeatNote() {
  const t = await getTranslations("health");
  const note = getUrbanHeatNote();

  return (
    <aside className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium text-white">{t("urbanHeatTitle")}</p>
        <span className="text-xs uppercase tracking-wide text-neutral-500">
          {t("urbanHeatSeed")}
        </span>
      </div>
      <p className="mt-1 text-slate-300">
        {t("urbanHeatBody", {
          city: note.city,
          month: note.monthLabel,
          anomaly: note.lstAnomalyC.toFixed(1),
          night: note.nightMinC.toFixed(1),
        })}
      </p>
      <p className="mt-2 text-xs text-slate-500">
        {t("urbanHeatHonesty")} ·{" "}
        <Link
          href={getSourceProvenancePath(note.sourceId)}
          className="text-white underline decoration-white/30 hover:decoration-white"
        >
          {note.sourceName}
        </Link>
      </p>
    </aside>
  );
}
