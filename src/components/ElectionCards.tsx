import { DISTRICTS, getDistrictName } from "@/lib/districts";
import {
  getCandidateColor,
  getDistrictWinnerPercentage,
  getElectionCandidate,
  getPresidentialElection2024,
} from "@/lib/elections";
import { Link } from "@/i18n/navigation";
import type { ElectionDistrictResult } from "@/lib/types";

export function ElectionDistrictRow({
  result,
  locale,
}: {
  result: ElectionDistrictResult;
  locale: string;
}) {
  const district = DISTRICTS.find((item) => item.slug === result.slug);
  const winner = getElectionCandidate(result.winner);
  const winnerPct = getDistrictWinnerPercentage(result);

  if (!district || !winner) {
    return null;
  }

  return (
    <Link
      href={`/elections/${result.slug}`}
      className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-teal-400/30 hover:bg-white/10"
    >
      <div>
        <p className="font-medium text-white">
          {getDistrictName(district, locale)}
        </p>
        <p className="text-xs text-slate-500">{district.province}</p>
      </div>
      <div className="text-right">
        <p
          className="text-sm font-medium"
          style={{ color: getCandidateColor(result.winner) }}
        >
          {winner.party}
        </p>
        <p className="text-xs text-slate-400">{winnerPct.toFixed(1)}%</p>
      </div>
    </Link>
  );
}

export function ElectionResultBars({
  result,
}: {
  result: ElectionDistrictResult;
}) {
  const election = getPresidentialElection2024();

  return (
    <div className="space-y-3">
      {election.candidates.map((candidate) => {
        const votes = result.results[candidate.id];
        const pct = (votes / result.validVotes) * 100;
        return (
          <div key={candidate.id}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-slate-300">
                {candidate.name}{" "}
                <span className="text-slate-500">({candidate.party})</span>
              </span>
              <span className="text-slate-400">
                {votes.toLocaleString()} ({pct.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: getCandidateColor(candidate.id),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
