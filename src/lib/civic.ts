import mpData from "@/data/mp-scorecards-seed.json";
import type { MpScorecardSnapshot } from "./types";

const snapshot = mpData as MpScorecardSnapshot;

export function getMpScorecardSnapshot(): MpScorecardSnapshot {
  return snapshot;
}

export function getMpByElectoralDistrict(district: string) {
  return snapshot.members.filter(
    (member) => member.electoralDistrict === district,
  );
}

export function getMpById(id: string) {
  return snapshot.members.find((member) => member.id === id);
}
