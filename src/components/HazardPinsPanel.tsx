import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import type { FirmsSnapshot } from "@/lib/integrations/firms";
import type { GdacsSnapshot } from "@/lib/integrations/gdacs";

export function HazardPinsPanel({
  firms,
  gdacs,
  labels,
  locale,
}: {
  firms: FirmsSnapshot;
  gdacs: GdacsSnapshot;
  locale: string;
  labels: {
    title: string;
    subtitle: string;
    firesTitle: string;
    firesEmpty: string;
    firesNeedsKey: string;
    firesCount: string;
    brightness: string;
    confidence: string;
    gdacsTitle: string;
    gdacsEmpty: string;
    alertLevel: string;
    eventType: string;
    country: string;
    report: string;
    firmsSource: string;
    gdacsSource: string;
  };
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">{labels.subtitle}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {labels.firesTitle}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                <Link
                  href={firms.provenancePath}
                  className="text-white underline decoration-white/30 hover:decoration-white"
                >
                  {labels.firmsSource}
                </Link>
              </p>
            </div>
            <FreshnessBadge tier={firms.tier} />
          </div>

          {firms.needsApiKey ? (
            <p className="mt-4 text-sm text-slate-400">{labels.firesNeedsKey}</p>
          ) : firms.error ? (
            <p className="mt-4 text-sm text-slate-400">{firms.error}</p>
          ) : firms.fires.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">{labels.firesEmpty}</p>
          ) : (
            <>
              <p className="mt-3 text-sm text-slate-300">
                {labels.firesCount.replace(
                  "{count}",
                  String(firms.fires.length),
                )}
              </p>
              <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                {firms.fires.slice(0, 12).map((fire) => (
                  <li
                    key={fire.id}
                    className="rounded-xl border border-white/5 bg-black/15 px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-white">
                      {fire.latitude.toFixed(3)}, {fire.longitude.toFixed(3)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(fire.acqDate).toLocaleString(locale)}
                      {fire.brightness != null
                        ? ` · ${labels.brightness} ${fire.brightness.toFixed(0)}`
                        : ""}
                      {fire.confidence
                        ? ` · ${labels.confidence} ${fire.confidence}`
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {labels.gdacsTitle}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                <Link
                  href={gdacs.provenancePath}
                  className="text-white underline decoration-white/30 hover:decoration-white"
                >
                  {labels.gdacsSource}
                </Link>
              </p>
            </div>
            <FreshnessBadge tier={gdacs.tier} />
          </div>

          {gdacs.error ? (
            <p className="mt-4 text-sm text-slate-400">{gdacs.error}</p>
          ) : gdacs.events.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">{labels.gdacsEmpty}</p>
          ) : (
            <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
              {gdacs.events.map((event) => (
                <li
                  key={event.id}
                  className="rounded-xl border border-white/5 bg-black/15 px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-white">{event.name}</p>
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      {event.alertLevel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {labels.eventType}: {event.eventType}
                    {event.country
                      ? ` · ${labels.country}: ${event.country}`
                      : ""}
                  </p>
                  {event.reportUrl ? (
                    <a
                      href={event.reportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs text-white underline decoration-white/30 hover:decoration-white"
                    >
                      {labels.report}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
}
