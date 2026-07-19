import type { SourceDefinition } from "./types";

export const SOURCES: SourceDefinition[] = [
  {
    id: "octane_fuel",
    name: "Octane Fuel API",
    category: "transport",
    url: "https://octane-api.fly.dev",
    cadenceMinutes: 10080,
    adapter: "partner",
  },
  {
    id: "lk_flood_api",
    name: "Sri Lanka Flood API",
    category: "disaster",
    url: "https://lk-flood-api.vercel.app",
    cadenceMinutes: 10,
    adapter: "api",
  },
  {
    id: "cbsl_fx",
    name: "Central Bank of Sri Lanka",
    category: "economy",
    url: "https://www.cbsl.gov.lk",
    cadenceMinutes: 1440,
    adapter: "scrape",
  },
];

export function getSource(id: string): SourceDefinition | undefined {
  return SOURCES.find((source) => source.id === id);
}
