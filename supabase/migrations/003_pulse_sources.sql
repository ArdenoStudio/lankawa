-- Seed pulse sources required for Phase C ingest persistence.
insert into sources (id, name, category, url, cadence_minutes, active)
values
  ('open_meteo', 'Open-Meteo Colombo Weather', 'weather', 'https://api.open-meteo.com', 60, true),
  ('ceb_power', 'CEB Care Power Status', 'energy', 'https://cebcare.ceb.lk', 15, true),
  ('cse_lk', 'Colombo Stock Exchange', 'economy', 'https://www.cse.lk', 15, true),
  ('news_rss', 'Sri Lanka News RSS', 'news', 'internal://news', 60, true),
  ('life_platform_food', 'Ariva Life Platform — Food federation', 'economy', 'internal://food', 60, true)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  url = excluded.url,
  cadence_minutes = excluded.cadence_minutes,
  active = excluded.active;
