import { Link } from "@/i18n/navigation";
import type { CseNotice } from "@/lib/integrations/cse";
import { getSourceProvenancePath } from "@/lib/sources";

export function CseAnnouncementsStrip({
  notices,
  isFallback,
  sourceId,
  locale,
  labels,
}: {
  notices: CseNotice[];
  isFallback: boolean;
  sourceId: string;
  locale: string;
  labels: {
    title: string;
    subtitle: string;
    empty: string;
    seed: string;
    honesty: string;
    sourceName: string;
  };
}) {
  const rows = notices.slice(0, 6);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
          <p className="mt-1 text-sm text-neutral-400">{labels.subtitle}</p>
        </div>
        {isFallback ? (
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            {labels.seed}
          </span>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="border border-white/10 px-4 py-3 text-sm text-neutral-500">
          {labels.empty}
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((notice) => (
            <li
              key={notice.id ?? `${notice.publishedAt}-${notice.title}`}
              className="border border-white/10 px-4 py-3"
            >
              <p className="text-sm font-medium text-white">{notice.title}</p>
              <p className="mt-1 text-xs text-neutral-500">
                {notice.company && !notice.title.includes(notice.company)
                  ? `${notice.company} · `
                  : null}
                {new Date(notice.publishedAt).toLocaleString(locale)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-neutral-500">{labels.honesty}</p>
      <p className="text-xs text-neutral-500">
        <Link
          href={getSourceProvenancePath(sourceId)}
          className="text-white underline decoration-white/30 hover:decoration-white"
        >
          {labels.sourceName}
        </Link>
      </p>
    </section>
  );
}
