import type { FreshnessTier, PulseSnapshot } from "./types";

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

export interface DbSourceStatusRow {
  id: string;
  name: string;
  category: string;
  cadenceMinutes: number;
  lastCheckedAt: string | null;
  lastOk: boolean | null;
  lastError: string | null;
  freshnessTier: FreshnessTier;
}

export interface IngestRunRecord {
  sourceId: string;
  startedAt: string;
  finishedAt: string;
  ok: boolean;
  observationsCount: number;
  latencyMs: number;
  error: string | null;
  triggerSource: string;
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
  if (getDbConfig() !== null) {
    return true;
  }
  return Boolean(process.env.DATABASE_URL?.trim());
}

export async function isDatabaseConnected(): Promise<boolean> {
  const config = getDbConfig();
  if (!config) {
    return false;
  }

  try {
    const response = await fetch(`${config.url}/rest/v1/sources?select=id&limit=1`, {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
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

export async function getAllSourceStatusFromDb(): Promise<
  DbSourceStatusRow[]
> {
  const rows = await dbFetch<
    Array<{
      id: string;
      name: string;
      category: string;
      cadence_minutes: number;
      last_checked_at: string | null;
      last_ok: boolean | null;
      last_error: string | null;
      freshness_tier: FreshnessTier;
    }>
  >("source_status?select=id,name,category,cadence_minutes,last_checked_at,last_ok,last_error,freshness_tier");

  if (!rows) {
    return [];
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    cadenceMinutes: row.cadence_minutes,
    lastCheckedAt: row.last_checked_at,
    lastOk: row.last_ok,
    lastError: row.last_error,
    freshnessTier: row.freshness_tier,
  }));
}

export async function upsertObservations(
  rows: Array<{
    source_id: string;
    metric: string;
    value: number;
    unit: string;
    observed_at: string;
  }>,
): Promise<number> {
  if (rows.length === 0) {
    return 0;
  }

  await dbFetch("observations", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });

  return rows.length;
}

export async function reportSourceHealth(payload: {
  source_id: string;
  ok: boolean;
  latency_ms: number;
  observations_count: number;
  error: string | null;
  consecutive_failures: number;
}): Promise<void> {
  await dbFetch("source_health", {
    method: "POST",
    headers: {
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });
}

export async function savePulseSnapshot(
  snapshot: PulseSnapshot,
): Promise<void> {
  await dbFetch("pulse_snapshots", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      generated_at: snapshot.generatedAt,
      payload: snapshot,
    }),
  });
}

export async function getPulseHistory(
  days = 30,
): Promise<Array<{ generatedAt: string; snapshot: PulseSnapshot }>> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceIso = since.toISOString();

  const rows = await dbFetch<
    Array<{ generated_at: string; payload: PulseSnapshot }>
  >(
    `pulse_snapshots?generated_at=gte.${encodeURIComponent(sinceIso)}&select=generated_at,payload&order=generated_at.desc&limit=500`,
  );

  if (!rows) {
    return [];
  }

  return rows.map((row) => ({
    generatedAt: row.generated_at,
    snapshot: row.payload,
  }));
}

export async function recordIngestRun(
  record: IngestRunRecord,
): Promise<void> {
  await dbFetch("ingest_runs", {
    method: "POST",
    headers: {
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      source_id: record.sourceId,
      started_at: record.startedAt,
      finished_at: record.finishedAt,
      ok: record.ok,
      observations_count: record.observationsCount,
      latency_ms: record.latencyMs,
      error: record.error,
      trigger_source: record.triggerSource,
    }),
  });
}

export async function recordExportAudit(payload: {
  dataset: string;
  clientIp: string | null;
  format: string;
}): Promise<void> {
  if (!getDbConfig()) {
    return;
  }

  try {
    await dbFetch("export_audit", {
      method: "POST",
      headers: {
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        dataset: payload.dataset,
        client_ip: payload.clientIp,
        format: payload.format,
      }),
    });
  } catch {
    // Non-blocking audit trail
  }
}

export async function recordEvent(
  eventType: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  if (!getDbConfig()) {
    return;
  }

  try {
    await dbFetch("events", {
      method: "POST",
      headers: {
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        event_type: eventType,
        payload,
      }),
    });
  } catch {
    // Non-blocking event log
  }
}
