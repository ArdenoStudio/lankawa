-- Phase 8: pulse history, ingest audit, export audit, platform events

create table if not exists pulse_snapshots (
  id bigserial primary key,
  generated_at timestamptz not null,
  payload jsonb not null,
  unique (generated_at)
);

create index if not exists idx_pulse_snapshots_generated_at
  on pulse_snapshots (generated_at desc);

create table if not exists ingest_runs (
  id bigserial primary key,
  source_id text references sources(id),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  ok boolean not null,
  observations_count int default 0,
  latency_ms int,
  error text,
  trigger_source text default 'cron'
);

create index if not exists idx_ingest_runs_source_started
  on ingest_runs (source_id, started_at desc);

create table if not exists export_audit (
  id bigserial primary key,
  dataset text not null,
  requested_at timestamptz default now(),
  client_ip text,
  format text default 'json'
);

create index if not exists idx_export_audit_requested_at
  on export_audit (requested_at desc);

create table if not exists events (
  id bigserial primary key,
  event_type text not null,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_events_type_created
  on events (event_type, created_at desc);

-- RLS disabled for service-role access via PostgREST; enable policies if exposing anon key.
