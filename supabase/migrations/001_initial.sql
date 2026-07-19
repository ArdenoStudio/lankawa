-- Lankawa initial schema (PostGIS + freshness)

create extension if not exists postgis;

create table if not exists sources (
  id text primary key,
  name text not null,
  category text not null,
  url text not null,
  cadence_minutes int not null,
  active boolean default true
);

create table if not exists observations (
  id bigserial primary key,
  source_id text references sources(id),
  metric text not null,
  value numeric not null,
  unit text,
  observed_at timestamptz not null,
  meta jsonb default '{}'::jsonb,
  unique (source_id, metric, observed_at)
);

create table if not exists source_health (
  id bigserial primary key,
  source_id text references sources(id),
  ok boolean not null,
  latency_ms int,
  observations_count int default 0,
  error text,
  consecutive_failures int default 0,
  checked_at timestamptz default now()
);

insert into sources (id, name, category, url, cadence_minutes, active) values
  ('octane_fuel', 'Octane Fuel API', 'transport', 'https://octane-api.fly.dev', 10080, true),
  ('lk_flood_api', 'Sri Lanka Flood API', 'disaster', 'https://lk-flood-api.vercel.app', 10, true),
  ('cbsl_fx', 'Central Bank of Sri Lanka', 'economy', 'https://www.cbsl.gov.lk', 1440, true)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  url = excluded.url,
  cadence_minutes = excluded.cadence_minutes,
  active = excluded.active;

create or replace view source_status as
select
  s.id,
  s.name,
  s.category,
  s.cadence_minutes,
  h.checked_at as last_checked_at,
  h.ok as last_ok,
  h.error as last_error,
  case
    when h.checked_at is null then 'unknown'
    when h.checked_at > now() - (s.cadence_minutes || ' minutes')::interval then 'fresh'
    when h.checked_at > now() - (s.cadence_minutes * 3 || ' minutes')::interval then 'stale'
    else 'down'
  end as freshness_tier
from sources s
left join lateral (
  select * from source_health sh
  where sh.source_id = s.id
  order by checked_at desc
  limit 1
) h on true;
