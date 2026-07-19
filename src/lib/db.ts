import type { FreshnessTier } from "./types";

export interface DbObservation {
  sourceId: string;
  metric: string;
  value: number;
  unit: string | null;
  observedAt: string;
}

export interface DbSourceHealth {
  sourceId: string;
  ok: boolean;
  checkedAt: string;
  error: string | null;
  tier: FreshnessTier;
}

interface DbConfig {
  url: string;
  key: string;
}

function getDbConfig(): DbConfig | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? null;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    null;

  if (!url || !key) {
    return null;
  }

  return { url: url.replace(/\/$/, ""), key };
}

export function isDatabaseConfigured(): boolean {
  return getDbConfig() !== null;
}

async function dbFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const config = getDbConfig();
  if (!config) {
    return null;
  }

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Database request failed (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  return (await response.json()) as T;
}

export async function getLatestObservation(
  sourceId: string,
  metric: string,
): Promise<DbObservation | null> {
  const rows = await dbFetch<
    Array<{
      source_id: string;
      metric: string;
      value: number;
      unit: string | null;
      observed_at: string;
    }>
  >(
    `observations?source_id=eq.${encodeURIComponent(sourceId)}&metric=eq.${encodeURIComponent(metric)}&select=source_id,metric,value,unit,observed_at&order=observed_at.desc&limit=1`,
  );

  if (!rows?.[0]) {
    return null;
  }

  const row = rows[0];
  return {
    sourceId: row.source_id,
    metric: row.metric,
    value: Number(row.value),
    unit: row.unit,
    observedAt: row.observed_at,
  };
}

export async function getLatestSourceHealth(
  sourceId: string,
): Promise<DbSourceHealth | null> {
  const rows = await dbFetch<
    Array<{
      source_id: string;
      ok: boolean;
      checked_at: string;
      error: string | null;
    }>
  >(
    `source_health?source_id=eq.${encodeURIComponent(sourceId)}&select=source_id,ok,checked_at,error&order=checked_at.desc&limit=1`,
  );

  if (!rows?.[0]) {
    return null;
  }

  const row = rows[0];
  return {
    sourceId: row.source_id,
    ok: row.ok,
    checkedAt: row.checked_at,
    error: row.error,
    tier: row.ok ? "fresh" : "down",
  };
}
