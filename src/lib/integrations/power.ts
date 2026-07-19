export type PowerSupplyStatus = "normal" | "scheduled" | "unknown";

export interface PowerStatus {
  status: PowerSupplyStatus;
  summary: string;
  observedAt: string;
  /** Internal path for outage context — links to the disaster hub. */
  provenancePath: "/disaster";
}

export async function fetchPowerStatus(): Promise<PowerStatus> {
  const observedAt = new Date().toISOString();

  return {
    status: "normal",
    summary: "No scheduled outages",
    observedAt,
    provenancePath: "/disaster",
  };
}
