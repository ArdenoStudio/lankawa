import type { FloodAlertSummary } from "../types";

const FLOOD_API_BASE =
  process.env.FLOOD_API_BASE ?? "https://lk-flood-api.vercel.app";

export async function fetchFloodAlertSummary(): Promise<FloodAlertSummary[]> {
  const response = await fetch(`${FLOOD_API_BASE}/alerts/summary`, {
    next: { revalidate: 600 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Flood API returned ${response.status}`);
  }

  return response.json() as Promise<FloodAlertSummary[]>;
}

export async function fetchFloodHealth(): Promise<{ status: string }> {
  const response = await fetch(`${FLOOD_API_BASE}/health`, {
    next: { revalidate: 300 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Flood API health returned ${response.status}`);
  }

  return response.json() as Promise<{ status: string }>;
}
