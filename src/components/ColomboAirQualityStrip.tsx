import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fetchColomboOpenMeteoAirQuality } from "@/lib/integrations/aqi";
import { getSourceProvenancePath } from "@/lib/sources";

function formatUg(value: number | null): string {
  return value == null ? "—" : value.toFixed(1);
}

export async function ColomboAirQualityStrip() {
  const t = await getTranslations("home");
  const snapshot = await fetchColomboOpenMeteoAirQuality();

  if (!snapshot) {
    return null;
  }

  const items = [
    {
      id: "usAqi",
      label: t("aqiStripUsAqi"),
      value: String(snapshot.usAqi),
    },
    {
      id: "pm25",
      label: t("aqiStripPm25"),
      value: formatUg(snapshot.pm25),
    },
    {
      id: "pm10",
      label: t("aqiStripPm10"),
      value: formatUg(snapshot.pm10),
    },
    {
      id: "no2",
      label: t("aqiStripNo2"),
      value: formatUg(snapshot.nitrogenDioxide),
    },
    {
      id: "o3",
      label: t("aqiStripO3"),
      value: formatUg(snapshot.ozone),
    },
    {
      id: "dust",
      label: t("aqiStripDust"),
      value: formatUg(snapshot.dust),
    },
  ];

  return (
    <section
      className="lk-motion-fade-up space-y-2"
      aria-label={t("aqiStripLabel")}
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {t("aqiStripTitle")}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-600">
            {t("aqiStripAsOf", {
              date: new Date(snapshot.asOf).toLocaleString(),
            })}
          </p>
        </div>
        <Link
          href={getSourceProvenancePath(snapshot.sourceId)}
          className="text-xs text-teal-300 hover:text-teal-200"
        >
          {t("aqiStripSource")}
        </Link>
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="list"
        aria-label={t("aqiStripLabel")}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            role="listitem"
            className="lk-motion-slide-in inline-flex min-w-[4.5rem] flex-1 basis-[calc(33.333%-0.5rem)] flex-col gap-0.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 sm:basis-[calc(16.666%-0.5rem)]"
            style={{ animationDelay: `${40 + index * 35}ms` }}
          >
            <span className="text-[10px] uppercase tracking-wide text-slate-500">
              {item.label}
            </span>
            <span className="text-sm font-semibold tabular-nums text-slate-100">
              {item.value}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-600">{t("aqiStripHonesty")}</p>
    </section>
  );
}
