import researchData from "@/data/civic-research-seed.json";

export interface CivicResearchItem {
  id: string;
  org: "CPA" | "Verité" | string;
  title: string;
  url: string;
  publishedAt: string;
  summary: string;
}

export interface CivicResearchSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  isSeed: boolean;
  items: CivicResearchItem[];
}

const snapshot = researchData as CivicResearchSnapshot;

export function getCivicResearchSnapshot(): CivicResearchSnapshot {
  return snapshot;
}
