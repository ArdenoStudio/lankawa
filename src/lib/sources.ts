import type { SourceCategory, SourceDefinition } from "./types";

export const SOURCES: SourceDefinition[] = [
  {
    id: "world_pump_seed",
    name: "Regional pump seed",
    category: "economy",
    adapter: "seed",
    url: "https://lankawa.vercel.app/economy",
    cadenceMinutes: 10080,
    description:
      "Curated regional retail petrol pump USD/L peers for comparison with Sri Lanka CPC petrol 92. Not a live global fuel API.",
    methodology:
      "Peer rows are a dated seed snapshot. Sri Lanka is computed live as Octane CPC petrol 92 LKR/L divided by CBSL USD/LKR when both are available. Labeled seed vs live in the Economy world-pump card.",
    metrics: ["regional_petrol_usd_per_litre"],
  },
  {
    id: "octane_fuel",
    name: "Octane Fuel API",
    category: "transport",
    url: "https://octane-api.fly.dev",
    cadenceMinutes: 10080,
    adapter: "partner",
    description:
      "Weekly CPC fuel price updates for petrol and diesel across Sri Lanka.",
    methodology:
      "Lankawa ingests partner fuel price records on a weekly cadence. Prices are normalized to LKR per litre for petrol 92 and auto diesel, tagged with the observation timestamp, and surfaced on the home pulse and economy pages.",
    metrics: ["fuel_petrol_92", "fuel_diesel"],
  },
  {
    id: "lk_flood_api",
    name: "Sri Lanka Flood API",
    category: "disaster",
    url: "https://lk-flood-api.vercel.app",
    cadenceMinutes: 10,
    adapter: "api",
    description:
      "River station flood alert levels aggregated for national monitoring.",
    methodology:
      "Lankawa polls river station alert levels every few minutes, groups stations by alert level (NORMAL, WATCH, etc.), and displays counts on the pulse, disaster page, and source health dashboard. For station-level readings (`fetchLatestFloodLevels`), when lk-flood-api timestamps lag by more than 6 hours (or the API is down), live Irrigation ArcGIS gauges are preferred via the same FloodStationLevel shape — see irrigation_arcgis_gauges.",
    metrics: ["flood_stations"],
  },
  {
    id: "irrigation_arcgis_gauges",
    name: "Irrigation Department river gauges (ArcGIS)",
    category: "disaster",
    url: "https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/arcgis/rest/services/gauges_2_view/FeatureServer/0",
    cadenceMinutes: 15,
    adapter: "api",
    description:
      "Public Irrigation Department ArcGIS FeatureServer for major-river gauge levels, rainfall, and alert thresholds.",
    methodology:
      "Lankawa queries gauges_2_view ordered by EditDate DESC, collapses to latest-per-gauge, and maps water_level against alertpull/minorpull/majorpull into NORMAL/ALERT/WARNING/DANGER. Primary panel on `/disaster`; also used as a stale/down fallback for district/province flood station lists when lk-flood-api lags. Seed fallback when ArcGIS is unreachable. Civic republish — not an official DMC flood warning.",
    metrics: [
      "irrigation_gauge_count",
      "irrigation_elevated_count",
      "irrigation_water_level_m",
    ],
  },
  {
    id: "cbsl_fx",
    name: "Central Bank of Sri Lanka",
    category: "economy",
    url: "https://www.cbsl.gov.lk",
    cadenceMinutes: 1440,
    adapter: "scrape",
    description:
      "Official USD/LKR buy and sell exchange rates published by CBSL.",
    methodology:
      "Lankawa retrieves the latest USD/LKR buy and sell rates daily. A scheduled ingest job persists observations; the pulse layer falls back to a live scrape or cached value if the database is unavailable.",
    metrics: ["usd_lkr"],
  },
  {
    id: "market_fx_fawaz",
    name: "Market FX (fawazahmed0 currency-api)",
    category: "economy",
    url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json",
    cadenceMinutes: 1440,
    adapter: "api",
    description:
      "Community market mid USD→LKR rate from the public fawazahmed0 currency-api CDN (jsDelivr + Pages.dev mirror).",
    methodology:
      "Lankawa fetches `usd.min.json` with LankawaBot UA and a 10s timeout, preferring the jsDelivr CDN then the Pages.dev mirror. Parses `date` + `usd.lkr` only — never invents a rate. Shown beside CBSL as unofficial market context; CBSL remains the official buy/sell band. Cadence ~daily.",
    metrics: ["usd_lkr_market_mid"],
  },
  {
    id: "world_bank_lka",
    name: "World Bank WDI — Sri Lanka",
    category: "economy",
    url: "https://api.worldbank.org/v2/country/LKA/indicator",
    cadenceMinutes: 10080,
    adapter: "api",
    description:
      "World Development Indicators for Sri Lanka: GDP growth, CPI inflation, and population.",
    methodology:
      "Parallel GETs with `mrnev=1` for NY.GDP.MKTP.KD.ZG, FP.CPI.TOTL.ZG, and SP.POP.TOTL (25s timeout each, LankawaBot UA). Returns null if zero indicators succeed — no curated fake tip. Complements CBSL seed macro; not CBSL official. Weekly cadence.",
    metrics: ["wb_gdp_growth", "wb_cpi", "wb_population"],
  },
  {
    id: "open_meteo_geocoding",
    name: "Open-Meteo Geocoding",
    category: "civic",
    url: "https://geocoding-api.open-meteo.com/v1/search",
    cadenceMinutes: 10080,
    adapter: "api",
    description:
      "Sri Lanka place search (Open-Meteo geocoding) mapped to Lankawa district slugs.",
    methodology:
      "Queries Open-Meteo geocoding with `countryCode=LK`, count=5. Maps admin2/name onto DISTRICTS / districtSlugFromName. Used by the civic assistant when sync district name match fails. Empty array on failure — never invents coordinates.",
    metrics: ["geocode_hits"],
  },
  {
    id: "lk_public_holidays",
    name: "Sri Lanka public / bank holidays (CBSL seed)",
    category: "civic",
    url: "https://www.cbsl.gov.lk/en/about/about-the-bank/bank-holidays-2026",
    cadenceMinutes: 525600,
    adapter: "seed",
    description:
      "Curated 2026 CBSL bank and public holidays (Gazette Extraordinary 2438/22) — no Calendarific key.",
    methodology:
      "Static seed from the official CBSL 2026 bank-holidays page. Vesak and May Day share 2026-05-01 as one combined entry. Exposed via getHolidaySnapshot / isPublicHolidayToday (Asia/Colombo). Not a live gazette poller.",
    metrics: ["public_holiday_today"],
  },
  {
    id: "wikipedia_lk",
    name: "Wikipedia — Sri Lanka district summaries",
    category: "civic",
    url: "https://en.wikipedia.org/api/rest_v1/page/summary/",
    cadenceMinutes: 1440,
    adapter: "api",
    description:
      "English Wikipedia REST summary extracts for Sri Lanka administrative districts.",
    methodology:
      "Maps district slug → `{Name} District`, fetches REST summary with LankawaBot UA (8s timeout, revalidate 86400). Appends at most one sentence to assistant district answers with Wikipedia + Lankawa citations. Null on failure — never invents extracts.",
    metrics: ["wikipedia_district_extract"],
  },
  {
    id: "nominatim_osm",
    name: "Nominatim (OpenStreetMap) reverse geocode",
    category: "civic",
    url: "https://nominatim.openstreetmap.org/reverse",
    cadenceMinutes: 10080,
    adapter: "api",
    description:
      "On-demand reverse geocode for a single disaster map pin — not bulk labeling.",
    methodology:
      "Client PinPlaceLabel fetches `/api/v1/geocode/reverse` once per expanded pin. Server calls Nominatim with LankawaBot UA + contact email, 8s timeout. Hard rate limit 10/min. Sync formatApproxPlace always available without network. Never reverse-geocodes entire pin lists.",
    metrics: ["reverse_geocode_label"],
  },
  {
    id: "coingecko_btc_lkr",
    name: "CoinGecko — BTC/LKR",
    category: "economy",
    url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=lkr",
    cadenceMinutes: 60,
    adapter: "api",
    description:
      "Indicative Bitcoin price in Sri Lankan rupees for remittance corridor context.",
    methodology:
      "Optional CoinGecko simple/price fetch (no API key, 10s timeout, LankawaBot UA). Returns null on failure. Not a remittance product, not CBSL, not investment advice — chip only beside the remittance board.",
    metrics: ["btc_lkr"],
  },
  {
    id: "cbsl_gold",
    name: "Central Bank of Sri Lanka — Daily Gold Rates",
    category: "economy",
    url: "https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates/daily-gold-rates",
    cadenceMinutes: 1440,
    adapter: "scrape",
    description:
      "Official CBSL daily gold price in Sri Lankan rupees per troy ounce.",
    methodology:
      "Lankawa queries the public CBSL daily gold-rate form for XAU/LKR rows over a short recent window and shows only parsed official rows. If CBSL does not publish a current gold row or the endpoint is unavailable, the economy page omits the gold card.",
    metrics: ["gold_lkr_troy_ounce"],
  },
  {
    id: "lpg_cylinder_prices",
    name: "Sri Lanka LPG cylinder prices",
    category: "economy",
    url: "https://www.litrogas.com/price-list/",
    cadenceMinutes: 1440,
    adapter: "scrape",
    description:
      "Household LPG refill prices for Sri Lanka from public Litro and LAUGFS price list pages.",
    methodology:
      "Lankawa probes the public Litro and LAUGFS LPG price-list pages with short server-side timeouts and parses district refill tables for 12.5 kg, 5 kg, and smaller domestic cylinders. If both pages are unavailable or their table shape changes, the economy page shows a clearly labeled July 2026 seed snapshot for Colombo household cylinders.",
    metrics: ["lpg_12_5kg_colombo", "lpg_5kg_colombo"],
  },
  {
    id: "election_commission_2024",
    name: "Election Commission of Sri Lanka",
    category: "civic",
    url: "https://results.elections.gov.lk/pre2024/",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description:
      "Presidential election 2024 district-level first-preference results.",
    methodology:
      "Lankawa ingested official 2024 presidential district results as a static seed dataset. Full results tables and maps are available on the elections pages without linking to external result portals.",
    metrics: ["presidential_2024"],
  },
  {
    id: "election_commission_pe_2024",
    name: "Election Commission of Sri Lanka",
    category: "civic",
    url: "https://results.elections.gov.lk/allisland.php",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description:
      "Parliamentary general election 2024 district seat allocations.",
    methodology:
      "Lankawa ingested official 2024 parliamentary district seat results as a static seed dataset. Seat breakdowns are available on the elections pages without linking to external result portals.",
    metrics: ["parliamentary_2024"],
  },
  {
    id: "cbsl_macro",
    name: "Central Bank of Sri Lanka",
    category: "economy",
    url: "https://www.cbsl.gov.lk",
    cadenceMinutes: 43200,
    adapter: "scrape",
    description:
      "Macroeconomic indicators including inflation, GDP growth, and foreign reserves.",
    methodology:
      "Key macro indicators are maintained as a curated static seed from CBSL public releases. USD/LKR historical series uses live CBSL scrape when available, with a 30-day static fallback.",
    metrics: ["inflation_ccpi", "gdp_growth", "forex_reserves", "usd_lkr_series"],
  },
  {
    id: "cbsl_policy_rates",
    name: "Central Bank of Sri Lanka — Policy rates",
    category: "economy",
    url: "https://www.cbsl.gov.lk/en/rates-and-indicators/policy-rates",
    cadenceMinutes: 1440,
    adapter: "scrape",
    description:
      "Overnight Policy Rate (OPR) with SDFR/SLFR corridor and Statutory Reserve Ratio (SRR).",
    methodology:
      "OPR (+ SRR when present) scraped from the public CBSL plrates.php board. That endpoint intermittently returns HTTP 500 with a still-usable HTML body — Lankawa parses the body when OPR is present and retries once. SDFR/SLFR are usually absent from the board and come from a curated tip of historical_policy_interest_rates.xlsx (effective 26.05.2026). From 27 Nov 2024 CBSL uses a single OPR; SDFR/SLFR are corridor only, not primary instruments. Full seed fallback when the board fails. See docs/CBSL_RATES_API_DEEP_DIVE.md.",
    metrics: ["opr", "sdfr", "slfr", "srr"],
  },
  {
    id: "cbsl_payments_bulletin",
    name: "CBSL Payments Bulletin",
    category: "economy",
    url: "https://www.cbsl.gov.lk/en/publications/other-publications/statistical-publications/payments-bulletin",
    cadenceMinutes: 129600,
    adapter: "seed",
    description:
      "Quarterly payment and settlement systems statistics — CEFTS, JustPay, and LANKAQR volume/value from the English Payments Bulletin PDF.",
    methodology:
      "Curated seed extract from the tip CBSL Payments Bulletin PDF (Tables 18, 21–24; LankaPay). Cadence is quarterly — never presented as a live rails dashboard. Prefer bulletin tables over lankapay.net marketing counters. PDF tip and seed path: docs/CBSL_PAYMENTS_BULLETIN.md.",
    metrics: [
      "cefts_volume",
      "cefts_value",
      "justpay_volume",
      "justpay_value",
      "lankaqr_volume",
      "lankaqr_merchants",
    ],
  },
  {
    id: "dcs_ncpi",
    name: "Department of Census and Statistics — NCPI",
    category: "economy",
    url: "https://www.statistics.gov.lk/InflationAndPrices/StaticalInformation/MonthlyNCPI",
    cadenceMinutes: 43200,
    adapter: "partner",
    description:
      "Official National Consumer Price Index (Base 2021=100) headline and core inflation.",
    methodology:
      "Curated from DCS monthly NCPI news releases (YoY, MoM, index, food/non-food). Cadence is monthly — never presented as a live inflation feed. Distinct from Lankawa COL composite.",
    metrics: ["ncpi_index", "ncpi_yoy", "ncpi_mom", "ncpi_core_yoy"],
  },
  {
    id: "pucsl_tariff",
    name: "Public Utilities Commission of Sri Lanka — Domestic tariff",
    category: "economy",
    url: "https://www.pucsl.gov.lk/electricity/tariff/domestic/",
    cadenceMinutes: 525600,
    adapter: "partner",
    description:
      "Approved domestic (residential) electricity energy and fixed charges by consumption block.",
    methodology:
      "Curated from PUCSL end-user tariff decisions for CEB/LECO domestic consumers. Progressive slabs differ for ≤60 kWh vs >60 kWh monthly use. Indicative bill estimate only — verify against the latest PUCSL decision and your bill.",
    metrics: ["electricity_energy_lkr_kwh", "electricity_fixed_lkr"],
  },
  {
    id: "nwsdb_tariff",
    name: "NWSDB — Domestic water tariff / BillCalculator",
    category: "economy",
    url: "https://ebis.waterboard.lk/directPay/#/BillCalculator",
    cadenceMinutes: 525600,
    adapter: "partner",
    description:
      "Domestic and Samurdhi/tenement water tariff slabs with indicative monthly bill estimate (usage + service + VAT).",
    methodology:
      "Seed slabs curated from Gazette Extraordinary No. 2343/28 (effective 1 Aug 2023) Tariff Tables 01–02. Progressive m³ usage charge; service charge is the band for total monthly consumption; indicative 18% VAT on usage+service. Optional live POST to api_nwsdb/bill/BillCalculator for Calculation totals (CategoryId=1 Domestic, 30-day period). Response Tariff[].UnitRate fields are not used for ingest. Indicative only — not your NWSDB bill.",
    metrics: [
      "water_usage_lkr_m3",
      "water_service_lkr",
      "water_vat_lkr",
      "water_bill_total_lkr",
    ],
  },
  {
    id: "pucsl_generation",
    name: "PUCSL / CEB generation mix (seed)",
    category: "economy",
    url: "https://www.pucsl.gov.lk/",
    cadenceMinutes: 43200,
    adapter: "partner",
    description:
      "Indicative electricity generation-mix shares (hydro/thermal/renewables).",
    methodology:
      "Seed shares curated from public PUCSL/CEB summaries for the tariff-card spark. Not a live SCADA feed.",
    metrics: ["generation_hydro_pct", "generation_thermal_pct"],
  },
  {
    id: "census_2024_seed",
    name: "Census 2024 district footnotes (seed)",
    category: "civic",
    url: "http://www.statistics.gov.lk/",
    cadenceMinutes: 525600,
    adapter: "partner",
    description:
      "District population footnotes for atlas context — stale-OK seed from public DCS/HDX tables.",
    methodology:
      "Curated population footnotes for district pages. Not a live census API; prefer official DCS publications for formal citation.",
    metrics: ["census_population_2024"],
  },
  {
    id: "moh_notices_seed",
    name: "Ministry of Health notices (seed)",
    category: "health",
    url: "https://www.health.gov.lk/",
    cadenceMinutes: 1440,
    adapter: "scrape",
    description: "Public health notices strip on /health — live MoH RSS when available.",
    methodology:
      "Seed notice list for the health page. When moh_rss (feed id) or Ministry of Health (feed name) appears in the news pulse, live headlines replace the seed strip.",
    metrics: ["moh_notices"],
  },
  {
    id: "moh_rss",
    name: "Ministry of Health RSS",
    category: "health",
    url: "https://www.health.gov.lk/feed/",
    cadenceMinutes: 60,
    adapter: "api",
    description: "Live MoH public notices via WordPress RSS on /health.",
    methodology:
      "Headlines are pulled through `news.ts` feed id `moh_rss` and filtered in `moh-notices.ts` (matches feed id or display name). Falls back to moh_notices_seed when the feed is empty.",
    metrics: ["moh_notices"],
  },
  {
    id: "open_meteo_flood",
    name: "Open-Meteo Flood (GloFAS)",
    category: "disaster",
    url: "https://flood-api.open-meteo.com/",
    cadenceMinutes: 360,
    adapter: "api",
    description:
      "Simulated river discharge near Sri Lanka basin centroids from GloFAS via Open-Meteo Flood.",
    methodology:
      "Lankawa samples flood-api.open-meteo.com river_discharge for Kelani/Mahaweli/Kalu basin centroids. Complements local gauges — not a DMC warning.",
    metrics: ["glofas_discharge"],
  },
  {
    id: "nbro_landslide",
    name: "NBRO / DMC Landslide Early Warning",
    category: "disaster",
    url: "https://www.dmc.gov.lk",
    cadenceMinutes: 360,
    adapter: "scrape",
    description:
      "District-scale landslide watch/warning context for Sri Lanka’s highland wet season.",
    methodology:
      "Lankawa reads the public lk_dmc landslide summary, then parses tip blocks.json (district names + Level 1/2/3 DSD cells by bbox) for watch/warning tiers. If the tip layout is missing or unparseable, a curated seed overlay is shown with explicit seed labels. Civic republish — not an official evacuation map. Always verify NBRO/DMC bulletins before acting.",
    metrics: ["landslide_watch_count", "landslide_warning_count"],
  },
  {
    id: "public_services_stub",
    name: "Lankawa Public Services Directory",
    category: "civic",
    url: "internal://services",
    cadenceMinutes: 525600,
    adapter: "partner",
    description:
      "Hospitals, MOH offices, police stations, schools, and GN offices indexed by district (seed data).",
    methodology:
      "A curated seed directory covers representative facilities across all 25 districts — typically 6+ facilities per district (hospital, divisional hospital, MOH, police, school, GN) until official open-data feeds are integrated.",
    metrics: ["public_services"],
  },
  {
    id: "budget_verite_seed",
    name: "Verité Research / Budget Speech summaries",
    category: "economy",
    url: "internal://budget",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description:
      "National budget appropriations by ministry and sector for FY 2024/25 and 2025/26.",
    methodology:
      "Curated static seed aligned with published budget speech totals and Verité Research sector summaries. Figures are rounded approximations — not digitized official appropriation ledgers.",
    metrics: ["budget_expenditure", "budget_revenue"],
  },
  {
    id: "civic_research_seed",
    name: "CPA / Verité Research drops",
    category: "civic",
    url: "internal://civic-research",
    cadenceMinutes: 10080,
    adapter: "seed",
    description:
      "Centre for Policy Alternatives and Verité Research publication drops shown on /civic.",
    methodology:
      "Prefers live headlines from `cpa_rss` and `verite_rss` in the news pulse (`civic-research.ts`). Falls back to curated seed JSON with honest seed labelling when those feeds are empty.",
    metrics: ["civic_research_drops"],
  },
  {
    id: "epidemiology_unit_seed",
    name: "Epidemiology Unit — Weekly Dengue Report",
    category: "health",
    url: "internal://health",
    cadenceMinutes: 10080,
    adapter: "scrape",
    description:
      "Weekly dengue case counts by administrative district.",
    methodology:
      "Representative district-level seed data patterned on Epidemiology Unit weekly report formats. Not live scraped — updated manually until ingest pipeline is approved.",
    metrics: ["dengue_weekly"],
  },
  {
    id: "epidemiology_unit",
    name: "Epidemiology Unit — Weekly Dengue Report (live)",
    category: "health",
    url: "https://www.epid.gov.lk/weekly-epidemiological-report/weekly-epidemiological-report",
    cadenceMinutes: 10080,
    adapter: "scrape",
    description:
      "Public weekly dengue surveillance reports from the Epidemiology Unit.",
    methodology:
      "Lankawa probes public Epidemiology Unit weekly report and legacy trends pages with short timeouts. Live dengue provenance is used only when a district-level public table can be parsed; otherwise the health page falls back to the seed snapshot.",
    metrics: ["dengue_weekly"],
  },
  {
    id: "manthri_inspired_seed",
    name: "Parliamentary records (seed)",
    category: "civic",
    url: "internal://civic",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description:
      "Sample MP attendance and legislative activity scorecards.",
    methodology:
      "Illustrative seed inspired by Manthri.lk patterns. Not scraped from Manthri — representative sample members for demo purposes only.",
    metrics: ["mp_attendance", "mp_bills"],
  },
  {
    id: "egp_procurement_seed",
    name: "Government Procurement — e-GP notices",
    category: "civic",
    url: "internal://tenders",
    cadenceMinutes: 1440,
    adapter: "scrape",
    description:
      "Sample government procurement tender notices with district filters.",
    methodology:
      "Static seed notices modeled on e-GP publication formats. Not live from e-GP portal — for demonstration and API testing only.",
    metrics: ["tenders"],
  },
  {
    id: "egp_procurement",
    name: "PROMISe e-GP Sri Lanka procurement notices",
    category: "civic",
    url: "https://promise.lk/?p=vendor_cont&a=all_procurements&type=e",
    cadenceMinutes: 1440,
    adapter: "scrape",
    description:
      "Public procurement notices from the national PROMISe e-GP portal.",
    methodology:
      "Lankawa fetches the public PROMISe procurement notice table server-side, normalizes closing dates, districts, categories, and procuring entities, and falls back to seed notices if the portal is unreachable or the table shape changes.",
    metrics: ["tenders"],
  },
  {
    id: "propertylk_api",
    name: "PropertyLK Price Intelligence (live)",
    category: "civic",
    url: "internal://property",
    cadenceMinutes: 43200,
    adapter: "partner",
    description:
      "District-level median land and property price bands from the PropertyLK partner API.",
    methodology:
      "Server-side fetch from the PropertyLK production API (`/api/v1/districts`). When the upstream times out or returns empty data, Lankawa falls back to the static seed dataset and surfaces seed provenance on the property page and pulse.",
    metrics: ["property_median_per_perch"],
  },
  {
    id: "propertylk_seed",
    name: "PropertyLK Price Intelligence",
    category: "civic",
    url: "internal://property",
    cadenceMinutes: 43200,
    adapter: "partner",
    description:
      "District-level median land and property price bands across Sri Lanka.",
    methodology:
      "Representative seed data aligned with PropertyLK price intelligence patterns. Used when the live partner API is unavailable — the property page and pulse show an explicit seed fallback notice.",
    metrics: ["property_median_per_perch"],
  },
  {
    id: "vehicle_platform_api",
    name: "AutoLens LK Vehicle Intelligence (live)",
    category: "transport",
    url: "internal://vehicles",
    cadenceMinutes: 86400,
    adapter: "partner",
    description:
      "Used vehicle listing medians, popular makes, and district price bands from the Vehicle Platform API.",
    methodology:
      "Server-side fetch from `/api/v1/stats/summary`, `/stats/district-prices`, and `/listings/makes`. District names are mapped to Lankawa slugs. Falls back to seed when upstream is unavailable.",
    metrics: ["vehicle_median_price", "vehicle_listings"],
  },
  {
    id: "vehicle_platform_seed",
    name: "AutoLens LK Vehicle Intelligence",
    category: "transport",
    url: "internal://vehicles",
    cadenceMinutes: 86400,
    adapter: "partner",
    description:
      "Representative used vehicle market bands by district and popular makes.",
    methodology:
      "Static seed aligned with AutoLens LK market snapshots. Used when the live Vehicle Platform API is unavailable.",
    metrics: ["vehicle_median_price", "vehicle_listings"],
  },
  {
    id: "food_platform_api",
    name: "FoodLK Price Intelligence (live)",
    category: "economy",
    url: "internal://food",
    cadenceMinutes: 86400,
    adapter: "partner",
    description:
      "Staple food prices, essentials basket, and district meal-cost bands.",
    methodology:
      "FoodLK cleaned surfaces only: prefer `/hub/summary` and `/basket/estimate?preset=essentials` (staples). Legacy `/stats|categories|home/summary` are fallbacks. Labeled live only when coverage/staples carry real metrics — empty or HTTP 500 shells fail cleanly to WFP without implying live supermarket. Keells/Cargills/SPAR retail ingest stays in FoodLK. Upstream catalog: docs/FOOD_API_SOURCES.md.",
    metrics: ["food_basket_estimate", "staple_prices"],
  },
  {
    id: "wfp_hdx",
    name: "WFP HDX food prices (Sri Lanka)",
    category: "economy",
    url: "https://data.humdata.org/dataset/wfp-food-prices-for-sri-lanka",
    cadenceMinutes: 1440,
    adapter: "api",
    description:
      "Direct WFP/HDX CSV retail and wholesale staple prices for Sri Lanka.",
    methodology:
      "While FoodLK public API returns 500s, Lankawa fetches the HDX CSV `wfp_food_prices_lka.csv` via `food-direct.ts`, averages latest retail (else wholesale) quotes for rice, onions, lentils, coconut, sugar, and wheat flour, and estimates an essentials basket from non-stale staples only (lagged quotes stay visible but are excluded). District meal bands remain seed. Not HARTI or NCPI.",
    metrics: ["food_basket_estimate", "staple_prices"],
  },
  {
    id: "spar2u_retail",
    name: "SPAR2U retail catalog",
    category: "economy",
    url: "https://spar2u.lk/products.json",
    cadenceMinutes: 360,
    adapter: "api",
    description:
      "Optional single-page SPAR2U grocery catalog bypass for staple shelf prices.",
    methodology:
      "When FoodLK and WFP HDX fail, Lankawa fetches one page (`limit=250`) of SPAR2U Shopify `products.json` via `food-spar.ts` (UA LankawaBot/1.0, 12s timeout, revalidate 21600). First reasonable title matches for rice, dhal/lentil, onion, sugar, coconut, and flour become staples; pack sizes normalize to per-kg when labeled. HTTP 429 or fetch failures skip quietly to Life. District meal bands remain seed. Not HARTI or NCPI.",
    metrics: ["food_basket_estimate", "staple_prices"],
  },
  {
    id: "life_platform_food",
    name: "Ariva Life Platform — Food federation",
    category: "economy",
    url: "internal://food",
    cadenceMinutes: 3600,
    adapter: "partner",
    description:
      "Food domain metrics when FoodLK, WFP, and SPAR2U fail.",
    methodology:
      "Server-side fetch from Life `/life/overview` food domain after FoodLK, WFP HDX, and SPAR2U retail. Healthy or degraded with metrics is accepted; seed/down fixture-only domains are skipped. District meal bands remain Lankawa seed until FoodLK recovers.",
    metrics: ["food_basket_estimate", "staple_prices"],
  },
  {
    id: "food_platform_seed",
    name: "FoodLK Price Intelligence",
    category: "economy",
    url: "internal://food",
    cadenceMinutes: 86400,
    adapter: "partner",
    description:
      "Staple food prices and district meal-cost estimates for cost-of-living enrichment.",
    methodology:
      "Representative seed from FoodLK / Life Platform patterns. District monthly baskets align with the Lankawa cost-of-living seed. Used when FoodLK, WFP HDX, SPAR2U, and Life food endpoints are unavailable.",
    metrics: ["food_basket_estimate", "staple_prices"],
  },
  {
    id: "life_platform_api",
    name: "Ariva Life Platform (live)",
    category: "economy",
    url: "internal://ardeno",
    cadenceMinutes: 3600,
    adapter: "partner",
    description:
      "Unified living-cost orchestrator across food, fuel, property, and vehicles.",
    methodology:
      "Server-side fetch from `/api/v1/life/overview` on the Life Platform backend. Powers the Ardeno stack hub with domain health and headline metrics. Falls back to a constructed seed overview when unavailable.",
    metrics: ["life_overview", "domain_health"],
  },
  {
    id: "life_platform_seed",
    name: "Ariva Life Platform",
    category: "economy",
    url: "internal://ardeno",
    cadenceMinutes: 3600,
    adapter: "partner",
    description:
      "Seed overview for the Ardeno living-cost stack when the Life Platform API is unavailable.",
    methodology:
      "Static domain summaries referencing Octane, PropertyLK, AutoLens LK, and FoodLK seed modules. Internal links only — no external UI navigation.",
    metrics: ["life_overview"],
  },
  {
    id: "local_government_seed",
    name: "Department of Local Government — Directory",
    category: "civic",
    url: "internal://local-government",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description:
      "Municipal councils, urban councils, and Pradeshiya Sabhas indexed by district.",
    methodology:
      "Curated seed directory covering 327 local bodies across all 25 districts. Not exhaustive — representative breadth until official open-data feeds are integrated.",
    metrics: ["local_government_bodies"],
  },
  {
    id: "election_commission_2010",
    name: "Election Commission of Sri Lanka",
    category: "civic",
    url: "internal://elections/history",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description: "Presidential election 2010 district-level results (seed).",
    methodology:
      "Historical presidential results seeded from published EC totals. District figures are approximations aligned with national totals.",
    metrics: ["presidential_2010"],
  },
  {
    id: "election_commission_2015",
    name: "Election Commission of Sri Lanka",
    category: "civic",
    url: "internal://elections/history",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description: "Presidential election 2015 district-level results (seed).",
    methodology:
      "Historical presidential results seeded from published EC totals. District figures are approximations aligned with national totals.",
    metrics: ["presidential_2015"],
  },
  {
    id: "transport_directory_seed",
    name: "Lankawa Transport Directory",
    category: "transport",
    url: "internal://transport",
    cadenceMinutes: 525600,
    adapter: "partner",
    description:
      "Major intercity bus routes, railway stations, and airports indexed by district.",
    methodology:
      "Static seed directory covering representative SLTB routes, SLR stations, and civil airports. No GTFS feed available for Sri Lanka.",
    metrics: ["bus_routes", "railway_stations", "airports"],
  },
  {
    id: "cost_of_living_seed",
    name: "Lankawa Cost of Living Index",
    category: "economy",
    url: "internal://cost-of-living",
    cadenceMinutes: 43200,
    adapter: "partner",
    description:
      "District composite cost-of-living index from fuel, property, and food basket proxies.",
    methodology:
      "Weighted seed index combining Octane petrol 92 reference price, PropertyLK median bands, estimated monthly food basket costs, and the coconut staple price as an explicit food signal. Not an official NCPI publication.",
    metrics: ["col_index", "food_basket_estimate", "coconut_unit_lkr"],
  },
  {
    id: "cost_of_living_composite",
    name: "Lankawa Cost of Living Composite",
    category: "economy",
    url: "internal://cost-of-living",
    cadenceMinutes: 1440,
    adapter: "partner",
    description:
      "Live-refreshed district COL index when Octane, PropertyLK, or Life/Food inputs are available.",
    methodology:
      "Combines live Octane petrol 92, PropertyLK district medians (Colombo-normalized property component), Food/Life essentials basket scaling, and the latest coconut staple item when present on top of the published seed relative structure. Not an official NCPI or HIES publication. See /cost-of-living/methodology.",
    metrics: ["col_index", "food_basket_estimate", "fuel_petrol_92", "coconut_unit_lkr"],
  },
  {
    id: "lankawa_land_pulse",
    name: "Lankawa Land Change Pulse",
    category: "environment",
    url: "internal://environment/land-change",
    cadenceMinutes: 525600,
    adapter: "partner",
    description:
      "District greenery/built-up change (2018→2024) plus weekly NDVI anomaly for civic morning checks.",
    methodology:
      "Curated district-scale greenery/built-up indices plus ETL-curated weekly NDVI anomaly (vs seasonal baseline) for product use. Inspired by public Sentinel-2 LULC/NDVI practice and prior art from Team Watchdog satellite2024 (MIT). Lankawa does not host full-resolution mosaics. Not official Survey Department land use. Weekly cron path writes seed NDVI rows to observations until live ETL. See /environment/land-change and docs/WATCHDOG_VS_LANKAWA.md.",
    metrics: ["greenery_index", "builtup_index", "ndvi_anomaly"],
  },
  {
    id: "gfm_flood_extent_seed",
    name: "GFM / flood-extent pins",
    category: "disaster",
    url: "internal://disaster/flood-extent-pins",
    cadenceMinutes: 10080,
    adapter: "seed",
    description:
      "Point pins for flood-extent attention on the disaster map — pins only, not mosaics.",
    methodology:
      "Seed GeoJSON point pins approximating flood-extent attention corridors. Scaffold until live GFM GeoJSON ingest. Not a DMC inundation product.",
    metrics: ["flood_extent_pin"],
  },
  {
    id: "urban_heat_lst_seed",
    name: "Colombo urban heat (LST seed)",
    category: "health",
    url: "internal://health/urban-heat",
    cadenceMinutes: 43200,
    adapter: "seed",
    description:
      "Monthly Colombo land-surface temperature anomaly note for health context.",
    methodology:
      "Seed LST anomaly and night minimum for Colombo metro. Not a heat-health warning. Verify Met Dept / MoH advisories before acting.",
    metrics: ["lst_anomaly_c", "night_min_c"],
  },
  {
    id: "open_meteo_marine",
    name: "Open-Meteo Marine",
    category: "disaster",
    url: "https://marine-api.open-meteo.com/v1/marine",
    cadenceMinutes: 180,
    adapter: "api",
    description:
      "Nearshore wave height, period, and direction for coastal districts.",
    methodology:
      "Open-Meteo marine model near district capital coordinates. Seed scaffold when the API is unavailable. Not a Met Dept or Navy warning.",
    metrics: ["wave_height_m", "wave_period_s", "wave_direction_deg"],
  },
  {
    id: "lankawa_debt_pulse",
    name: "Lankawa Foreign Debt Pulse",
    category: "economy",
    url: "internal://economy/debt",
    cadenceMinutes: 525600,
    adapter: "partner",
    description:
      "Historical commercial vs concessionary share of Sri Lanka external debt (2004–2020).",
    methodology:
      "Normalized from Team Watchdog databank-sri-lanka Foreign Debt Composition CSV (originally extracted from Central Bank of Sri Lanka reports). Lankawa re-hosts a morning-sized series with /sources provenance — not a live CBSL feed and not post-2020 restructuring figures. See docs/WATCHDOG_VS_LANKAWA.md.",
    metrics: ["commercial_debt_share", "concessionary_debt_share"],
  },
  {
    id: "environment_aqi_seed",
    name: "Lankawa Air Quality Index",
    category: "health",
    url: "internal://environment",
    cadenceMinutes: 1440,
    adapter: "partner",
    description:
      "Representative AQI and PM2.5 bands by administrative district.",
    methodology:
      "IQAir-style representative seed data patterned on urban/rural density proxies. Not live sensor readings.",
    metrics: ["aqi", "pm25"],
  },
  {
    id: "openaq_lk",
    name: "OpenAQ Sri Lanka PM2.5",
    category: "environment",
    url: "https://api.openaq.org/v3",
    cadenceMinutes: 60,
    adapter: "api",
    description:
      "OpenAQ PM2.5 observations for Colombo and other Sri Lanka locations where public sensors are available.",
    methodology:
      "Lankawa queries OpenAQ v3 locations and latest PM2.5 readings for Sri Lanka when an OpenAQ API key is configured. Districts with live matches are overlaid on the seed AQI map; unmatched districts retain seed values with mixed-coverage provenance. When OpenAQ misses Colombo, Open-Meteo air-quality (us_aqi / PM2.5) fills that district.",
    metrics: ["aqi", "pm25"],
  },
  {
    id: "open_meteo_air_quality",
    name: "Open-Meteo Air Quality",
    category: "environment",
    url: "https://air-quality-api.open-meteo.com/v1/air-quality",
    cadenceMinutes: 60,
    adapter: "api",
    description:
      "Modelled Colombo multi-pollutant air quality (US/EU AQI, PM2.5/PM10, NO₂, O₃, dust) from Open-Meteo.",
    methodology:
      "Lankawa polls air-quality-api.open-meteo.com for Colombo coordinates with current european_aqi, us_aqi, pm10, pm2_5, NO₂, SO₂, O₃, CO, UV, and dust. Used as a Colombo fallback when OpenAQ has no live station match, and surfaced as a home multi-pollutant strip. Model grid — not a DMC/CEA official station.",
    metrics: ["aqi", "pm25", "pm10", "no2", "o3", "dust"],
  },
  {
    id: "election_commission_2019",
    name: "Election Commission of Sri Lanka",
    category: "civic",
    url: "internal://elections/history",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description: "Presidential election 2019 district-level results (seed).",
    methodology:
      "Historical presidential results seeded from published EC totals. Used as swing baseline for 2024 comparisons.",
    metrics: ["presidential_2019"],
  },
  {
    id: "open_meteo",
    name: "Open-Meteo Forecast API",
    category: "environment",
    url: "https://api.open-meteo.com",
    cadenceMinutes: 60,
    adapter: "api",
    description:
      "Current temperature, precipitation, UV, and 7-day rain outlook for Colombo.",
    methodology:
      "Lankawa polls the Open-Meteo forecast endpoint for Colombo coordinates (6.9271°N, 79.8612°E) with current temperature/precip/UV plus daily uv_index_max and precipitation_sum for a 7-day rain outlook. WMO weather codes map to short labels. Observations refresh hourly on the home pulse.",
    metrics: ["weather_colombo", "weather_uv", "weather_rain_7d"],
  },
  {
    id: "nasa_firms",
    name: "NASA FIRMS active fires",
    category: "disaster",
    url: "https://firms.modaps.eosdis.nasa.gov/",
    cadenceMinutes: 60,
    adapter: "api",
    description:
      "VIIRS near-real-time fire detections inside Sri Lanka's land bounding box.",
    methodology:
      "When NASA_FIRMS_MAP_KEY is configured, Lankawa pulls the FIRMS area CSV for VIIRS_SNPP_NRT over the district-map land bbox (2-day window). Pins are raw detections — not fire department confirmed incidents. Without a key, the panel stays empty with an explicit needs-key note.",
    metrics: ["firms_fires"],
  },
  {
    id: "gdacs",
    name: "GDACS multi-hazard alerts",
    category: "disaster",
    url: "https://www.gdacs.org/",
    cadenceMinutes: 60,
    adapter: "api",
    description:
      "Global Disaster Alert and Coordination System events in the Indian Ocean / South Asia window.",
    methodology:
      "Lankawa reads the public GDACS GeoJSON SEARCH feed (TC/FL/EQ/DR/WF) and filters to a regional bbox (70–95°E, 5°S–25°N) plus any event listing Sri Lanka. Orange/Red alerts are prioritised for pins; Green events may appear for context. Not a Met Dept or DMC order.",
    metrics: ["gdacs_events"],
  },
  {
    id: "usgs_earthquake",
    name: "USGS Earthquake Event API",
    category: "disaster",
    url: "https://earthquake.usgs.gov/fdsnws/event/1/",
    cadenceMinutes: 60,
    adapter: "api",
    description:
      "Recent earthquake catalog entries within Sri Lanka's land bounding box.",
    methodology:
      "Lankawa queries the USGS FDSN Event Web Service with the same Sri Lanka land bounds used on district maps (79.5°E–82.1°E, 5.9°N–9.9°N), a rolling 30-day window, and magnitude ≥ 2.5. Results are shown as-is with no severity scoring — an empty list means USGS has no qualifying events in that box, not that seismic risk is zero. Offshore Indian Ocean events outside the land bbox are excluded by design.",
    metrics: ["earthquake_events"],
  },
  {
    id: "met_dept_warnings",
    name: "Department of Meteorology Weather Advisory System",
    category: "disaster",
    url: "https://was.meteo.gov.lk",
    cadenceMinutes: 30,
    adapter: "api",
    description:
      "Public weather warnings and advisories from Sri Lanka's Department of Meteorology.",
    methodology:
      "Lankawa reads the public Weather Advisory System dashboard JSON (`/dashboard-api/advisories`) and CAP RSS (`/cap/en/rss.xml`) with short server-side timeouts. When RSS items are present, linked CAP 1.1 XML files are fetched (capped) to enrich urgency/severity/certainty, instruction, and area text. Advisories remain the active source of truth; CAP-only rows appear only when the dashboard lists no hazards but CAP publishes items. There is no curated seed fallback — unavailable means the advisory API failed; empty means the dashboard reports no active hazards.",
    metrics: ["weather_warnings"],
  },
  {
    id: "ceb_power",
    name: "CEB Care — Power Outages",
    category: "disaster",
    url: "https://cebcare.ceb.lk",
    cadenceMinutes: 15,
    adapter: "scrape",
    description:
      "Scheduled load-shedding and present breakdown outages from CEB Care.",
    methodology:
      "Lankawa polls CEB Care demand-management schedules and samples present outage locations across provinces. Status is normalized to normal, scheduled, outage, or unknown — never a fabricated normal when data is unavailable. Results appear on the home pulse and disaster hub.",
    metrics: ["power_status"],
  },
  {
    id: "ceb_demand_mgmt_clusters",
    name: "CEB Care — Demand management clusters",
    category: "economy",
    url: "https://cebcare.ceb.lk/Incognito/DemandMgmtSchedule",
    cadenceMinutes: 15,
    adapter: "api",
    description:
      "Geo demand-management cluster summaries (groups A–Y) with customer counts from CEB Care.",
    methodology:
      "Server-side fetch via `demand-mgmt-clusters.ts`: antiforgery bootstrap on DemandMgmtSchedule, then GET `Incognito/GetDemandMgmtClusters?LoadShedGroupId=` for groups A–Y (concurrent, 15 min revalidate). Polygon points are discarded; only cluster and customer counts are kept. Seed fallback with isSeed honesty when CEB Care is unreachable. Indicative — confirm on cebcare.ceb.lk. Surfaced on `/economy` household energy.",
    metrics: ["demand_mgmt_clusters", "demand_mgmt_customers"],
  },
  {
    id: "leco_power",
    name: "LECO — Power Interruption Notices",
    category: "disaster",
    url: "https://www.leco.lk/powerIntrup_e.php",
    cadenceMinutes: 30,
    adapter: "scrape",
    description:
      "Scheduled power interruption notices for LECO Western / coastal service branches.",
    methodology:
      "Lankawa scrapes public LECO branch interruption pages (Galle, Kalutara, Moratuwa, Nugegoda, Kotte, Kelaniya, Negombo) and reads the Current Month LECO cell. Status is normal, scheduled, or unknown with isSeed honesty when the scrape fails — never a fabricated clear board. Shown beside CEB on the disaster hub.",
    metrics: ["leco_power_status"],
  },
  {
    id: "cse_lk",
    name: "Colombo Stock Exchange (public HTTP)",
    category: "economy",
    url: "https://www.cse.lk/api",
    cadenceMinutes: 15,
    adapter: "api",
    description:
      "ASPI, S&P SL20, sectors, most-active trades, foreign/domestic summary, exchange notices, and per-symbol quotes from public CSE JSON endpoints.",
    methodology:
      "Read-only fetch of undocumented public endpoints on `cse.lk` (e.g. `aspiData`, `marketSummery`, `tradeSummary`, `allSectors`, `GICSSectorSummery`, `mostActiveTrades`, `dailyMarketSummery`, `GET /notifications`, `approvedAnnouncement`, `companyInfoSummery`) — catalogued in `docs/CSE_API_DOCS.md` and Cookie-Cat21/cse-api-docs; adapter logic ported from the Chime/koel boundary, not PulseCSE. Browser CORS blocks client use — server proxy only. Surfaced on `/economy` and watchlist quotes via `/api/v1/cse/quotes`.",
    metrics: [
      "cse_aspi",
      "cse_market_status",
      "cse_sectors",
      "cse_most_active",
      "cse_foreign",
      "cse_notices",
      "cse_quotes",
    ],
  },
  {
    id: "bank_remittance_tt",
    name: "Bank TT remittance board",
    category: "economy",
    url: "https://www.combank.lk/api/exchange-rates",
    cadenceMinutes: 1440,
    adapter: "scrape",
    description:
      "Public indicative USD→LKR telegraphic-transfer style buy/sell bands from major Sri Lankan banks.",
    methodology:
      "Timed fetches via `remittance-banks.ts` of public bank FX surfaces: Commercial (`combank.lk/api/exchange-rates` TT columns), HNB (`venus.hnb.lk/api/get_exchange_rates_contents_web`), Seylan (`seylan.lk/api/exchange-rates-get-value/USD`), Sampath (`sampath.lk/api/exchange-rates` TTBUY/TTSEL), plus HTML scrape for People's (`peoplesbank.lk/exchange-rates/` TT columns), NDB (`ndbbank.com/rates/exchange-rates` TT columns), NSB (`nsb.lk/rates-tarriffs/nsb-exchange-rates/` TT columns), BOC (`boc.lk/rates-tariff` Telegraphic/PFCA/BFCA columns — POST `/api/exchange-rates` still 500, not wired), and DFCC (`dfcc.lk/rates-and-tariff/exchange-rates` TT Buying / DD·TT Selling). Per-bank isSeed when that bank fails; board isSeed only when all banks fail (full seed). LankawaBot UA + short timeouts. Lankawa is not affiliated with these banks — quotes are public indicative only, not advice or a remittance product. Not CBSL official rates; fees and corridors differ by product. Pair with the CBSL remittance calculator on /economy.",
    metrics: ["remittance_tt_buy", "remittance_tt_sell"],
  },
  {
    id: "bank_deposit_rates",
    name: "Bank FD deposit rates",
    category: "economy",
    url: "https://www.combank.lk/api/interest-rates-fd",
    cadenceMinutes: 1440,
    adapter: "api",
    description:
      "Public indicative LKR fixed-deposit interest rates (maturity strip) from major Sri Lankan banks.",
    methodology:
      "Timed fetches via `bank-deposit-rates.ts` of public bank FD JSON: Commercial (`combank.lk/api/interest-rates-fd`), Sampath (`sampath.lk/api/rates-and-charges/external` FDNOR maturity+monthly for 3/6/12/24/36/60M), Seylan (`GET seylan.lk/get-fd-data` — JSON body despite text/html), HNB Venus (`get_interest_rates_contents` Fixed Deposits Interest Rates maturity rows). Comparison matrix prefers maturity at common tenors. Per-bank seed when that bank fails; board isSeed only when all fail. LankawaBot UA + short timeouts. Lankawa is not affiliated with these banks — indicative only, not deposit advice. Schema: `docs/BANK_FD_API_SCHEMAS.md`. Surfaced on `/economy` beside the remittance board.",
    metrics: ["fd_maturity_rate"],
  },
  {
    id: "bank_card_offers",
    name: "Bank supermarket card days",
    category: "economy",
    url: "https://www.combank.lk/rewards-promotions",
    cadenceMinutes: 360,
    adapter: "api",
    description:
      "Public indicative supermarket card promotions from major Sri Lankan banks — Keells, Cargills, SPAR, Glomark, LAUGFS day-of-week discounts.",
    methodology:
      "Server-side fetch via `card-offers.ts` of public bank/network offer surfaces: Sampath `card-promotions?category=super_markets`, HNB Venus `get_all_web_card_promos` (supermarket merchant filter), Visa LK `POST /offers/api/portal/portal/perks/` (VMORC; `siteId=www_visa_com_lk` + supermarket `merchantName` filter — Glomark Thu etc.), ComBank `/rewards-promotions` HTML, Pan Asia `arr_offers` (Sucuri), DFCC supermarket hub, People's supermarket category HTML, NTB Mastercard promotions/hub HTML, NTB Amex `americanexpress.lk/en/offers/supermarket-offers` hub+detail HTML (browser UA; Imperva WAF → seed), NDB `/cards/card-offers/supermarkets` HTML slice, BOC `/personal-banking/card-offers` HTML (browser UA; CloudFront WAF → seed), and Amana debit `data-ics` Glomark Wednesday slice. Weekday cadence parsed from offer copy when present; otherwise validTo >= today. Keeps today's live rows and fills missing merchant/weekday slots from seed (per-offer isSeed); full seed only when no live offer matches today. Lankawa is not affiliated with the banks or merchants — offers are public indicative marketing; confirm at checkout and on the issuer/network site. Surfaced on `/cost-of-living`, `/food`, and `/economy`; home morning-delta strip links to `/food`.",
    metrics: ["supermarket_card_days"],
  },
  {
    id: "singer_emi",
    name: "Singer Sri Lanka — household EMI",
    category: "economy",
    url: "https://www.singersl.com/json-get-emi",
    cadenceMinutes: 360,
    adapter: "api",
    description:
      "Public multi-bank EMI / installment options for a featured Singer appliance sample SKU — not grocery card days.",
    methodology:
      "Server-side fetch via `singer-emi.ts`: `GET /json-get-emi?product_id=&product_price=` then capped `json-get-single-emi` per bank (max 6). Seed fallback with isSeed honesty when Imperva/WAF or timeouts. Monthly amounts are indicative for the sample SKU price only — confirm on singersl.com. Softlogic `variation-detail` per-SKU crawl intentionally skipped (too heavy for a thin chip). Abans/Arpico merchant EMI JSON not available — parked for bank IPP ingest. Surfaced on `/economy` under household tariffs.",
    metrics: ["household_emi_banks", "household_emi_tenors"],
  },
  {
    id: "news_rss",
    name: "Sri Lanka News RSS",
    category: "civic",
    url: "internal://news",
    cadenceMinutes: 30,
    adapter: "api",
    description:
      "Headline count and top story summaries from curated Sri Lanka news RSS feeds.",
    methodology:
      "Server-side RSS/Atom parse of approved public feeds via `src/lib/integrations/news.ts` (Daily Mirror, Ada Derana, Lankadeepa, Tamil Guardian, EconomyNext, Newswire, Island, LBO, Ada Derana Biz, Roar, DMC, Ministry of Health, CPA, Verité Research). Headlines are normalized with feed-id source attribution. Home pulse links to provenance rather than external click-through. Expansion backlog: docs/NEWS_RSS_BACKLOG.md. No HTML scrape; no paid third-party news APIs as core deps.",
    metrics: ["news_headlines"],
  },
  {
    id: "cricket_sl",
    name: "Sri Lanka cricket fixtures",
    category: "sports",
    url: "internal://cricket",
    cadenceMinutes: 10,
    adapter: "api",
    description:
      "Live or upcoming Sri Lanka cricket match card from a configured public cricket data API.",
    methodology:
      "Lankawa checks cricketdata/CricAPI current and upcoming match endpoints when `CRICKETDATA_API_KEY` or `CRICAPI_API_KEY` is configured. Only matches involving Sri Lanka that are live or scheduled for today in Sri Lanka time are surfaced; if no real match is found, the home card does not render.",
    metrics: ["cricket_match"],
  },
  {
    id: "lanka_stress_index",
    name: "Lanka Stress Index",
    category: "civic",
    url: "internal://stress",
    cadenceMinutes: 15,
    adapter: "computed",
    description:
      "Composite 0–100 civic stress score from available pulse signals — not an official government index.",
    methodology:
      "Computed in `lanka-stress.ts` from FX anomaly (MAD-z), elevated flood station count, CEB power status, Met Dept warnings, landslide watch/warning districts, and optional dengue high-risk districts. Each component is 0–weight; sum capped at 100. Missing inputs score 0 and set isPartial. Surfaced on home via LankaStressCard and `GET /api/v1/stress`.",
    metrics: ["lanka_stress_score", "lanka_stress_tier"],
  },
];

export function getSource(id: string): SourceDefinition | undefined {
  return SOURCES.find((source) => source.id === id);
}

/** Runtime/seed ids that should resolve to a registered /sources page. */
const PROVENANCE_ALIASES: Record<string, string> = {
  open_meteo_flood_seed: "open_meteo_flood",
  open_meteo_marine_seed: "open_meteo_marine",
  public_services_seed: "public_services_stub",
};

export function getSourceProvenancePath(id: string): string {
  const resolved = PROVENANCE_ALIASES[id] ?? id;
  return `/sources/${resolved}`;
}

export function getCategoryLabel(
  category: SourceCategory,
  labels: Record<SourceCategory, string>,
): string {
  return labels[category];
}
