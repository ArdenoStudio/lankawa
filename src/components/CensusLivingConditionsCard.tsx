import { Link } from "@/i18n/navigation";
import {
  getCensusLivingConditions,
  getCensusLivingForDistrict,
  type CensusLivingDistrictRow,
} from "@/lib/census";
import { getSourceProvenancePath } from "@/lib/sources";

const NATIONAL_SOURCE_ID = "census_2024_seed";

function ShareRow({
  label,
  value,
  national,
}: {
  label: string;
  value: number | null;
  national: number | null;
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
          {value.toFixed(1)}%
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

export function CensusLivingConditionsCard({
  slug,
  locale,
  labels,
}: {
  slug: string;
  locale: string;
  labels: {
    title: string;
    cleanCooking: string;
    pipeBorneWater: string;
    improvedSanitation: string;
    gridElectricity: string;
    households: string;
    honesty: string;
    source: string;
  };
}) {
  const row: CensusLivingDistrictRow | undefined = getCensusLivingForDistrict(slug);
  if (!row) {
    return null;
  }
  const snapshot = getCensusLivingConditions();

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
        {labels.title}
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        {labels.households.replace("{count}", row.households.toLocaleString(locale))}
      </p>
      <dl className="mt-2 space-y-1.5">
        <ShareRow
          label={labels.cleanCooking}
          value={row.cleanCookingPct}
          national={snapshot.national.cleanCookingPct}
        />
        <ShareRow
          label={labels.pipeBorneWater}
          value={row.pipeBorneWaterPct}
          national={snapshot.national.pipeBorneWaterPct}
        />
        <ShareRow
          label={labels.improvedSanitation}
          value={row.improvedSanitationPct}
          national={snapshot.national.improvedSanitationPct}
        />
        <ShareRow
          label={labels.gridElectricity}
          value={row.gridElectricityPct}
          national={snapshot.national.gridElectricityPct}
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
