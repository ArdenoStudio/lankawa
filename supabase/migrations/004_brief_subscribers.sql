-- Optional morning-brief email subscribers (double opt-in).
create table if not exists brief_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale text not null default 'en',
  confirm_token text not null,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  last_sent_at timestamptz
);

create index if not exists brief_subscribers_confirmed_idx
  on brief_subscribers (confirmed_at)
  where confirmed_at is not null and unsubscribed_at is null;
