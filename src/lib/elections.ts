import electionData from "@/data/elections-presidential-2024.json";
import type {
  ElectionCandidate,
  ElectionCandidateId,
  ElectionDistrictResult,
  PresidentialElection,
} from "./types";

const election = electionData as PresidentialElection;

export function getPresidentialElection2024(): PresidentialElection {
  return election;
}

export function getElectionDistrictResult(
  slug: string,
): ElectionDistrictResult | undefined {
  return election.districts.find((district) => district.slug === slug);
}

export function getElectionCandidate(
  id: string,
): ElectionCandidate | undefined {
  return election.candidates.find((candidate) => candidate.id === id);
}

export function getDistrictWinnerPercentage(
  result: ElectionDistrictResult,
): number {
  const winnerVotes = result.results[result.winner];
  if (!result.validVotes || winnerVotes == null) {
    return 0;
  }
  return (winnerVotes / result.validVotes) * 100;
}

export function countDistrictsWonBy(candidateId: ElectionCandidateId): number {
  return election.districts.filter(
    (district) => district.winner === candidateId,
  ).length;
}

export function getCandidateColor(
  candidateId: ElectionCandidate["id"],
): string {
  switch (candidateId) {
    case "akd":
      return "#14b8a6";
    case "premadasa":
      return "#60a5fa";
    case "wickremesinghe":
      return "#a78bfa";
    case "others":
      return "#94a3b8";
    default: {
      const _exhaustive: never = candidateId;
      return _exhaustive;
    }
  }
}
