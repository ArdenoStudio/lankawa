import { getTranslations } from "next-intl/server";

const LEVELS = [
  {
    key: "normal",
    status: "NORMAL",
    style: "border-teal-500/30 bg-teal-500/10 text-teal-100",
    bar: "bg-teal-400",
    width: "w-[18%]",
  },
  {
    key: "alert",
    status: "ALERT",
    style: "border-amber-500/30 bg-amber-500/10 text-amber-100",
    bar: "bg-amber-400",
    width: "w-[38%]",
  },
  {
    key: "warning",
    status: "WARNING",
    style: "border-orange-500/30 bg-orange-500/10 text-orange-100",
    bar: "bg-orange-400",
    width: "w-[62%]",
  },
  {
    key: "danger",
    status: "DANGER",
    style: "border-rose-500/30 bg-rose-500/10 text-rose-100",
    bar: "bg-rose-400",
    width: "w-[88%]",
  },
] as const;

export async function ExplainerDemoFlood() {
  const t = await getTranslations("learn.items.floodLevels.demo");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium text-white">{t("stationName")}</p>
            <p className="text-xs text-slate-500">{t("riverName")}</p>
          </div>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-100">
            ALERT
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-slate-500">{t("currentLevel")}</dt>
            <dd className="font-semibold text-white">2.14 m</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("alertLevel")}</dt>
            <dd className="font-semibold text-amber-200">2.00 m</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("warningLevel")}</dt>
            <dd className="font-semibold text-orange-200">2.50 m</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("dangerLevel")}</dt>
            <dd className="font-semibold text-rose-200">3.00 m</dd>
          </div>
        </dl>

        <div className="relative mt-6 h-28 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-t from-slate-900 to-slate-800">
          <div className="absolute inset-x-0 bottom-0 h-[38%] bg-teal-500/20" />
          <div className="absolute inset-x-0 bottom-[38%] border-t border-dashed border-amber-400/60" />
          <div className="absolute inset-x-0 bottom-[62%] border-t border-dashed border-orange-400/60" />
          <div className="absolute inset-x-0 bottom-[88%] border-t border-dashed border-rose-400/60" />
          <p className="absolute bottom-[40%] left-3 text-[10px] text-amber-200">
            {t("alertLine")}
          </p>
          <p className="absolute bottom-[64%] left-3 text-[10px] text-orange-200">
            {t("warningLine")}
          </p>
          <p className="absolute bottom-[90%] left-3 text-[10px] text-rose-200">
            {t("dangerLine")}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {LEVELS.map((level) => (
          <article
            key={level.key}
            className={`rounded-xl border p-4 ${level.style}`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{level.status}</p>
              <div className={`h-1.5 rounded-full ${level.width} ${level.bar}`} />
            </div>
            <p className="mt-2 text-sm opacity-90">{t(`levels.${level.key}`)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
