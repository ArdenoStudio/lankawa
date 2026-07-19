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

export function getMpBySlug(slug: string) {
  return snapshot.members.find((member) => member.slug === slug);
}

export function getMpName(
  member: { name: string; nameSi?: string; nameTa?: string },
  locale: string,
): string {
  if (locale === "si" && member.nameSi) {
    return member.nameSi;
  }
  if (locale === "ta" && member.nameTa) {
    return member.nameTa;
  }
  return member.name;
}

export function getAllMpSlugs(): string[] {
  return snapshot.members.map((member) => member.slug);
}

export function getMpById(id: string) {
  return snapshot.members.find((member) => member.id === id);
}
