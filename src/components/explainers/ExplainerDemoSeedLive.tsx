import { getTranslations } from "next-intl/server";

const ROWS = [
  { key: "fx", kind: "live" },
  { key: "fuel", kind: "live" },
  { key: "flood", kind: "live" },
  { key: "dengue", kind: "seed" },
  { key: "property", kind: "mixed" },
  { key: "tenders", kind: "seed" },
] as const;

const KIND_STYLES = {
  live: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  seed: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  mixed: "border-slate-500/30 bg-slate-500/10 text-slate-200",
} as const;

export async function ExplainerDemoSeedLive() {
  const t = await getTranslations("learn.items.seedVsLive.demo");

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("module")}</th>
              <th className="px-4 py-3 font-medium">{t("status")}</th>
              <th className="px-4 py-3 font-medium">{t("meaning")}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.key} className="border-t border-white/10">
                <td className="px-4 py-3 font-medium text-white">
                  {t(`rows.${row.key}.name`)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${KIND_STYLES[row.kind]}`}
                  >
                    {t(`kinds.${row.kind}`)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {t(`rows.${row.key}.note`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="font-medium text-emerald-100">{t("liveTitle")}</p>
          <p className="mt-2 text-sm text-slate-300">{t("liveBody")}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="font-medium text-amber-100">{t("seedTitle")}</p>
          <p className="mt-2 text-sm text-slate-300">{t("seedBody")}</p>
        </div>
      </div>
    </div>
  );
}
