const OCTANE_BASE =
  process.env.OCTANE_API_BASE ?? "https://octane-api.fly.dev";

export interface OctanePrice {
  fuel_type: string;
  source: string;
  price_lkr: number;
  recorded_at: string;
}

export interface OctaneLatestResponse {
  prices: OctanePrice[];
}

export async function fetchOctanePrices(): Promise<OctaneLatestResponse> {
  const response = await fetch(`${OCTANE_BASE}/v1/prices/latest`, {
    next: { revalidate: 3600 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Octane API returned ${response.status}`);
  }

  return response.json() as Promise<OctaneLatestResponse>;
}

export function pickCpcPrice(
  prices: OctanePrice[],
  fuelType: string,
): OctanePrice | undefined {
  return prices.find(
    (price) => price.fuel_type === fuelType && price.source === "cpc",
  );
}

export interface OctaneHistoryPoint {
  recorded_at: string;
  price_lkr: number;
}

export interface OctaneHistoryResponse {
  fuel_type: string;
  source: string;
  days: number;
  points: OctaneHistoryPoint[];
}

export async function fetchOctanePriceHistory(
  fuelType: string,
  days = 90,
): Promise<OctaneHistoryResponse> {
  const params = new URLSearchParams({
    fuel: fuelType,
    source: "cpc",
    limit: String(days),
  });
  const response = await fetch(
    `${OCTANE_BASE}/v1/prices/history?${params.toString()}`,
    {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(`Octane history API returned ${response.status}`);
  }

  return response.json() as Promise<OctaneHistoryResponse>;
}
