import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import { getDistrict, getDistrictName } from "@/lib/districts";
import type { LandslideSnapshot } from "@/lib/integrations/landslide";

export function LandslidePanel({
  snapshot,
  locale,
  labels,
}: {
  snapshot: LandslideSnapshot;
  locale: string;
  labels: {
    title: string;
    subtitle: string;
    watch: string;
    warning: string;
    watchSeed: string;
    warningSeed: string;
    asOf: string;
    seed: string;
    live: string;
    honesty: string;
    honestySeed: string;
    source: string;
    nbro: string;
    bulletin: string;
    topDistricts: string;
    topDistrictsSeed: string;
    noneActive: string;
    noneActiveSeed: string;
  };
}) {
  const active = snapshot.districts
    .filter((row) => row.tier === "watch" || row.tier === "warning")
    .sort((a, b) => {
      const rank = (tier: string) => (tier === "warning" ? 0 : 1);
      return rank(a.tier) - rank(b.tier);
    });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            {labels.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            {snapshot.isSeed ? labels.seed : labels.live}
          </span>
          <FreshnessBadge tier={snapshot.tier} />
        </div>
      </div>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
        {snapshot.isSeed ? (
          <p className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100/90">
            {labels.honestySeed}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-slate-500">
              {snapshot.isSeed ? labels.watchSeed : labels.watch}
            </p>
            <p className="mt-1 text-3xl font-semibold text-white">
              {snapshot.watchCount}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-slate-500">
              {snapshot.isSeed ? labels.warningSeed : labels.warning}
            </p>
            <p className="mt-1 text-3xl font-semibold text-white">
              {snapshot.warningCount}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-300">{snapshot.summary}</p>
        <p className="mt-2 text-xs text-slate-500">
          {labels.asOf}: {snapshot.asOf}
          {snapshot.isSeed ? ` · ${labels.seed}` : ` · ${labels.live}`}
        </p>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-white">
            {snapshot.isSeed ? labels.topDistrictsSeed : labels.topDistricts}
          </h3>
          {active.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              {snapshot.isSeed ? labels.noneActiveSeed : labels.noneActive}
            </p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {active.map((row) => {
                const district = getDistrict(row.slug);
                return (
                  <li
                    key={row.slug}
                    className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2"
                  >
                    <Link
                      href={`/districts/${row.slug}`}
                      className="text-white underline decoration-white/25 hover:decoration-white"
                    >
                      {district
                        ? getDistrictName(district, locale)
                        : row.slug}
                    </Link>
                    <span className="tabular-nums text-neutral-300">
                      {row.tier}
                      {row.dsDivisions.length > 0
                        ? ` · ${row.dsDivisions.slice(0, 2).join(", ")}`
                        : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          {labels.honesty}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          <Link
            href={snapshot.provenancePath}
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {labels.source}
          </Link>
          {" · "}
          <a
            href={snapshot.releaseUrl}
            target="_blank"
            rel="noreferrer"
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {labels.bulletin}
          </a>
          {" · "}
          <a
            href={snapshot.nbroUrl}
            target="_blank"
            rel="noreferrer"
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {labels.nbro}
          </a>
        </p>
      </article>
    </section>
  );
}
