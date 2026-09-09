import { Link } from "@/i18n/navigation";
import {
  getCensusAgeForDistrict,
  getCensusAgeStructure,
  type CensusAgeDistrictRow,
} from "@/lib/census";
import { getSourceProvenancePath } from "@/lib/sources";

const NATIONAL_SOURCE_ID = "census_2024_seed";

function AgeRow({
  label,
  value,
  national,
  suffix = "%",
}: {
  label: string;
  value: number | null;
  national: number | null;
  suffix?: string;
}) {
  if (value == null) {
    return null;
  }
  const delta =
    national != null ? Math.round((value - national) * 10) / 10 : null;
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <dt className="text-neutral-400">{label}</dt>
      <dd className="text-right">
        <span className="font-semibold tabular-nums text-white">
          {value.toFixed(1)}
          {suffix}
        </span>
        {delta != null ? (
          <span
            className={
              delta >= 0
                ? "ml-2 text-xs tabular-nums text-emerald-300/80"
                : "ml-2 text-xs tabular-nums text-amber-300/80"
            }
          >
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(1)} vs SL
          </span>
        ) : null}
      </dd>
    </div>
  );
}

export function CensusAgeStructureCard({
  slug,
  labels,
}: {
  slug: string;
  labels: {
    title: string;
    children: string;
    workingAge: string;
    ageing: string;
    dependency: string;
    honesty: string;
    source: string;
  };
}) {
  const row: CensusAgeDistrictRow | undefined = getCensusAgeForDistrict(slug);
  if (!row) {
    return null;
  }
  const snapshot = getCensusAgeStructure();

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
        {labels.title}
      </p>
      <dl className="mt-2 space-y-1.5">
        <AgeRow
          label={labels.children}
          value={row.childrenSharePct}
          national={snapshot.national.childrenSharePct}
        />
        <AgeRow
          label={labels.workingAge}
          value={row.workingAgeSharePct}
          national={snapshot.national.workingAgeSharePct}
        />
        <AgeRow
          label={labels.ageing}
          value={row.ageingSharePct}
          national={snapshot.national.ageingSharePct}
        />
        <AgeRow
          label={labels.dependency}
          value={row.dependencyRatio}
          national={snapshot.national.dependencyRatio}
          suffix=""
        />
      </dl>
      <p className="mt-2 text-xs text-neutral-500">{labels.honesty}</p>
      <p className="mt-1 text-xs text-neutral-500">
        <Link
          href={getSourceProvenancePath(NATIONAL_SOURCE_ID)}
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
