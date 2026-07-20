import { Link } from "@/i18n/navigation";
import {
  formatCensusPopulation,
  getCensus2024Snapshot,
  getCensusFootnoteForDistrict,
} from "@/lib/census";
import { getSourceProvenancePath } from "@/lib/sources";

export function CensusFootnote({
  slug,
  locale,
  labels,
}: {
  slug: string;
  locale: string;
  labels: {
    title: string;
    population: string;
    seed: string;
    honesty: string;
    source: string;
  };
}) {
  const footnote = getCensusFootnoteForDistrict(slug);
  if (!footnote) {
    return null;
  }

  const snapshot = getCensus2024Snapshot();

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
        {labels.title}
        {snapshot.isSeed ? ` · ${labels.seed}` : ""}
      </p>
      <p className="mt-2 text-white">
        {labels.population}:{" "}
        <span className="font-semibold tabular-nums">
          {formatCensusPopulation(footnote.population2024, locale)}
        </span>
      </p>
      <p className="mt-1 text-neutral-400">{footnote.note}</p>
      <p className="mt-2 text-xs text-neutral-500">{labels.honesty}</p>
      <p className="mt-1 text-xs text-neutral-500">
        <Link
          href={getSourceProvenancePath(snapshot.sourceId)}
          className="text-white underline decoration-white/30 hover:decoration-white"
        >
          {labels.source}
        </Link>
        {" · "}
        {snapshot.asOf}
      </p>
    </aside>
  );
}
