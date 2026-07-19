import { NextResponse } from "next/server";
import { getPresidentialElection2024 } from "@/lib/elections";
import { getSourceProvenancePath } from "@/lib/sources";

export async function GET() {
  const election = getPresidentialElection2024();

  return NextResponse.json({
    election: {
      id: election.id,
      type: election.type,
      date: election.date,
      sourceId: election.sourceId,
      sourceName: election.sourceName,
      provenancePath: getSourceProvenancePath(election.sourceId),
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
