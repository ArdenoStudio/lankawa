import { Link } from "@/i18n/navigation";
import type { MetDeptWarningsSnapshot } from "@/lib/integrations/metdept";

function formatTime(value: string, locale: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(locale);
}

function formatWindow(
  from: string | null,
  to: string | null,
  label: string,
  locale: string,
): string | null {
  if (!from && !to) {
    return null;
  }

  const fromLabel = from ? formatTime(from, locale) : "TBD";
  const toLabel = to ? formatTime(to, locale) : "TBD";
  return label.replace("{from}", fromLabel).replace("{to}", toLabel);
}

function warningTone(level: string): string {
  switch (level) {
    case "red":
      return "border-white/40 text-white";
    case "amber":
      return "border-white/30 text-slate-100";
    case "yellow":
      return "border-white/20 text-slate-200";
    default:
      return "border-white/15 text-slate-300";
  }
}

export function MetDeptWarningsPanel({
  snapshot,
  locale,
  labels,
}: {
  snapshot: MetDeptWarningsSnapshot | null;
  locale: string;
  labels: {
    title: string;
    subtitle: string;
    unavailableTitle: string;
    unavailableBody: string;
    emptyTitle: string;
    emptyBody: string;
    issuedAt: string;
    checkedAt: string;
    activeCount: string;
    validWindow: string;
    areas: string;
    noSummary: string;
    sourceNote: string;
    provenance: string;
  };
}) {
  const timestamp = snapshot?.issuedAt ?? snapshot?.checkedAt ?? null;
  const timestampLabel =
    snapshot && timestamp
      ? (snapshot.issuedAt ? labels.issuedAt : labels.checkedAt).replace(
          "{time}",
          formatTime(timestamp, locale),
        )
      : null;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{labels.subtitle}</p>
        </div>
        {timestampLabel ? (
          <p className="text-xs text-slate-500">{timestampLabel}</p>
        ) : null}
      </div>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
        {!snapshot ? (
          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-5">
            <p className="text-sm font-medium text-white">{labels.unavailableTitle}</p>
            <p className="mt-2 text-sm text-slate-400">{labels.unavailableBody}</p>
          </div>
        ) : snapshot.warnings.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-5">
            <p className="text-sm font-medium text-white">{labels.emptyTitle}</p>
            <p className="mt-2 text-sm text-slate-400">{labels.emptyBody}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">{labels.activeCount}</p>
            <ul className="space-y-3">
              {snapshot.warnings.map((warning) => {
                const windowLabel = formatWindow(
                  warning.validFrom,
                  warning.validTo,
                  labels.validWindow,
                  locale,
                );
                const areas = [
                  ...warning.districts,
                  ...warning.divisions,
                  ...warning.areas,
                ].slice(0, 8);

                return (
                  <li
                    key={warning.id}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{warning.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {warning.dayLabel}
                          {warning.bulletinNo ? ` · ${warning.bulletinNo}` : ""}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${warningTone(
                          warning.level,
                        )}`}
                      >
                        {warning.warningLabel ?? warning.level}
                      </span>
                    </div>

                    {windowLabel ? (
                      <p className="mt-3 text-xs text-slate-500">{windowLabel}</p>
                    ) : null}

                    {warning.summaryBullets.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-sm text-slate-300">
                        {warning.summaryBullets.map((bullet) => (
                          <li key={bullet} className="flex gap-2">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">{labels.noSummary}</p>
                    )}

                    {areas.length > 0 ? (
                      <p className="mt-3 text-xs text-slate-500">
                        {labels.areas}: {areas.join(", ")}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {snapshot ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-slate-500">
            <p>{labels.sourceNote}</p>
            <Link
              href={snapshot.provenancePath}
              className="text-slate-300 hover:text-white"
            >
              {labels.provenance}
            </Link>
          </div>
        ) : null}
      </article>
    </section>
  );
}
