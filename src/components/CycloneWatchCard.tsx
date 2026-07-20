import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import type { CycloneWatchSnapshot } from "@/lib/cyclone-watch";

export function CycloneWatchCard({
  watch,
  labels,
  locale,
}: {
  watch: CycloneWatchSnapshot;
  locale: string;
  labels: {
    title: string;
    subtitle: string;
    empty: string;
    active: string;
    alertLevel: string;
    report: string;
    honesty: string;
    source: string;
  };
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-neutral-400">
            {labels.subtitle}
          </p>
        </div>
        <FreshnessBadge tier={watch.active ? "fresh" : "stale"} />
      </div>

      {!watch.active || watch.events.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-400">{labels.empty}</p>
      ) : (
        <>
          <p className="mt-3 text-sm text-white">{labels.active}</p>
          <ul className="mt-3 space-y-2">
            {watch.events.slice(0, 6).map((event) => (
              <li
                key={event.id}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
              >
                <p className="font-medium text-white">{event.name}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {labels.alertLevel}: {event.alertLevel}
                  {event.country ? ` · ${event.country}` : ""}
                  {event.fromDate
                    ? ` · ${new Date(event.fromDate).toLocaleDateString(locale)}`
                    : ""}
                </p>
                {event.reportUrl ? (
                  <a
                    href={event.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-white underline decoration-white/30 hover:decoration-white"
                  >
                    {labels.report}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="mt-4 text-xs text-neutral-500">{labels.honesty}</p>
      <p className="mt-1 text-xs text-neutral-500">
        <Link
          href={watch.provenancePath}
          className="text-white underline decoration-white/30 hover:decoration-white"
        >
          {labels.source}
        </Link>
      </p>
    </section>
  );
}
