export type FreshnessTier = "fresh" | "stale" | "down" | "unknown";

export type SourceCategory =
  | "economy"
  | "disaster"
  | "energy"
  | "health"
  | "civic"
  | "transport";

export interface SourceDefinition {
  id: string;
  name: string;
  category: SourceCategory;
  url: string;
  cadenceMinutes: number;
  adapter: "api" | "scrape" | "partner";
}

export interface SourceHealth {
  id: string;
  name: string;
  category: SourceCategory;
  tier: FreshnessTier;
  lastSuccessAt: string | null;
  lastCheckedAt: string;
  error: string | null;
  sourceUrl: string;
}

export interface PulseMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  observedAt: string | null;
  tier: FreshnessTier;
  sourceId: string;
  sourceUrl: string;
  note?: string;
}

export interface District {
  slug: string;
  name: string;
  nameSi: string;
  nameTa: string;
  province: string;
  capital: string;
  population: number;
  areaSqKm: number;
}

export interface FloodAlertSummary {
  alertLevel: string;
  count: number;
  stations: string[];
}

export interface PulseSnapshot {
  generatedAt: string;
  metrics: PulseMetric[];
  flood: FloodAlertSummary[];
  sources: SourceHealth[];
}

export type ElectionCandidateId =
  | "akd"
  | "premadasa"
  | "wickremesinghe"
  | "others";

export interface ElectionCandidate {
  id: ElectionCandidateId;
  name: string;
  party: string;
  votes: number;
  percentage: number;
  finalPercentage?: number;
}

export interface ElectionDistrictResult {
  slug: string;
  winner: ElectionCandidateId;
  turnout: number;
  validVotes: number;
  results: Record<ElectionCandidateId, number>;
  electoralDistrict?: string;
  note?: string;
}

export interface PresidentialElection {
  id: string;
  type: "presidential";
  date: string;
  sourceUrl: string;
  sourceName: string;
  nationalWinner: ElectionCandidateId;
  turnout: number;
  validVotes: number;
  registeredElectors: number;
  candidates: ElectionCandidate[];
  districts: ElectionDistrictResult[];
}
