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
