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
