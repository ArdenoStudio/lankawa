import { getTranslations } from "next-intl/server";

/** P44 — seed-honest Hansard / MP note; do not fake live ingest. */
export async function HansardHonestyNote() {
  const t = await getTranslations("civic");

  return (
    <aside className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
      <p className="font-medium text-white">{t("hansardTitle")}</p>
      <p className="mt-1 text-slate-300">{t("hansardBody")}</p>
      <p className="mt-2 text-xs text-slate-500">{t("hansardHonesty")}</p>
    </aside>
  );
}
