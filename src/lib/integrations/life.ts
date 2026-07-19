import { getLifeOverviewSeed } from "@/lib/life";
import type { LifeDomain, LifeOverviewSnapshot } from "@/lib/types";

const LIFE_API_BASE =
  process.env.LIFE_API_BASE ?? "https://life-platform-backend.fly.dev/api/v1";

const FETCH_TIMEOUT_MS = 12000;

interface LifeOverviewApiResponse {
  generated_at: string;
  headline: string;
  freshness_note?: string;
  domains?: Array<{
    key: string;
    label: string;
    category: string;
    status: string;
    summary: string;
    observed_at?: string;
    last_updated_at?: string;
    freshness_note?: string;
    metrics?: Array<{
      label: string;
      value: number;
      unit: string;
    }>;
    highlights?: Array<{
      label: string;
      value: string;
      severity: string;
    }>;
  }>;
}

function mapDomain(
  domain: NonNullable<LifeOverviewApiResponse["domains"]>[number],
): LifeDomain {
  return {
    key: domain.key,
    label: domain.label,
    category: domain.category,
    status: domain.status,
    summary: domain.summary,
    observedAt: domain.observed_at ?? domain.last_updated_at ?? new Date().toISOString(),
    freshnessNote: domain.freshness_note,
    metrics: (domain.metrics ?? []).map((metric) => ({
      label: metric.label,
      value: metric.value,
      unit: metric.unit,
    })),
    highlights: domain.highlights,
  };
}

export async function fetchLifeOverview(): Promise<LifeOverviewSnapshot | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${LIFE_API_BASE}/life/overview`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as LifeOverviewApiResponse;
    if (!payload.domains?.length) {
      return null;
    }

    return {
      sourceId: "life_platform_api",
      sourceName: "Ariva Life Platform",
      asOf: payload.generated_at,
      headline: payload.headline,
      freshnessNote:
        payload.freshness_note ??
        "Live-powered summaries with short caching; each domain exposes its own source freshness.",
      domains: payload.domains.map(mapDomain),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getLifeOverview(): Promise<LifeOverviewSnapshot> {
  const live = await fetchLifeOverview();
  return live ?? getLifeOverviewSeed();
}
