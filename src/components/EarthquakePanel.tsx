import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import type { EarthquakeSnapshot } from "@/lib/integrations/earthquake";

function formatMagnitude(
  magnitude: number | null,
  magnitudeType: string | null,
): string {
  if (magnitude == null) {
    return "—";
  }

  const typeSuffix = magnitudeType ? ` ${magnitudeType}` : "";
  return `${magnitude.toFixed(1)}${typeSuffix}`;
}

function formatDepth(depthKm: number | null): string {
  if (depthKm == null || Number.isNaN(depthKm)) {
    return "—";
  }

  return `${depthKm.toFixed(1)} km`;
}

export function EarthquakePanel({
  snapshot,
  labels,
  locale,
}: {
  snapshot: EarthquakeSnapshot;
  locale: string;
  labels: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    emptyScopeNote: string;
    emptyOffshoreNote: string;
    errorTitle: string;
    errorBody: string;
    magnitude: string;
    depth: string;
    coordinates: string;
    occurredAt: string;
    tsunamiFlag: string;
    windowLabel: string;
    bboxLabel: string;
    sourceNote: string;
    provenance: string;
    countLabel: string;
  };
}) {
  const bbox = snapshot.bbox;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{labels.subtitle}</p>
        </div>
        <FreshnessBadge tier={snapshot.tier} />
      </div>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <p>{labels.windowLabel}</p>
          <p>{labels.bboxLabel}</p>
        </div>

        {snapshot.error ? (
          <div
            className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-5"
            role="status"
          >
            <p className="text-sm font-medium text-rose-100">{labels.errorTitle}</p>
            <p className="mt-2 text-sm text-slate-300">{labels.errorBody}</p>
            <p className="mt-3 text-xs text-slate-500">{snapshot.error}</p>
          </div>
        ) : snapshot.events.length === 0 ? (
          <div
            className="mt-5 rounded-xl border border-white/10 bg-black/20 px-4 py-6"
            role="status"
          >
            <div className="mx-auto flex max-w-lg flex-col items-center text-center">
              <div
                aria-hidden
                className="flex h-12 w-12 items-center justify-center rounded-full border border-teal-500/20 bg-teal-500/10"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-teal-300/80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="12" r="8.5" />
                  <circle cx="12" cy="12" r="4.5" />
                  <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" />
                </svg>
              </div>
              <p className="mt-4 text-base font-medium text-white">
                {labels.emptyTitle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {labels.emptyBody}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                {labels.emptyScopeNote}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                {labels.emptyOffshoreNote}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-slate-400">
              {labels.countLabel}
            </p>
            <ul className="space-y-3">
              {snapshot.events.map((event) => (
                <li
                  key={event.id}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{event.place}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {labels.occurredAt.replace(
                          "{time}",
                          new Date(event.occurredAt).toLocaleString(locale),
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {labels.magnitude}
                      </p>
                      <p className="text-lg font-semibold text-teal-300">
                        {formatMagnitude(event.magnitude, event.magnitudeType)}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-slate-500">{labels.depth}</dt>
                      <dd className="font-medium text-slate-200">
                        {formatDepth(event.depthKm)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">{labels.coordinates}</dt>
                      <dd className="font-medium text-slate-200">
                        {event.latitude.toFixed(2)}°N, {event.longitude.toFixed(2)}°E
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">{labels.tsunamiFlag}</dt>
                      <dd className="font-medium text-slate-200">
                        {event.tsunamiFlag === 1 ? "1" : "0"}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-slate-500">
          <p>{labels.sourceNote}</p>
          <Link
            href={snapshot.provenancePath}
            className="text-teal-300 hover:text-teal-200"
          >
            {labels.provenance}
          </Link>
        </div>
      </article>
    </section>
  );
}
