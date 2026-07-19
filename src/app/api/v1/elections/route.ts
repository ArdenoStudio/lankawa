import { NextResponse } from "next/server";
import { getPresidentialElection2024 } from "@/lib/elections";

export async function GET() {
  const election = getPresidentialElection2024();

  return NextResponse.json({
    election: {
      id: election.id,
      type: election.type,
      date: election.date,
      sourceUrl: election.sourceUrl,
      sourceName: election.sourceName,
      nationalWinner: election.nationalWinner,
      turnout: election.turnout,
      validVotes: election.validVotes,
      registeredElectors: election.registeredElectors,
      candidates: election.candidates,
    },
    districts: election.districts,
    generatedAt: new Date().toISOString(),
  });
}
