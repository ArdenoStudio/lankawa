# Comprehensive API Landscape for Sri Lanka — 180+ Endpoints & Data Surfaces

An exhaustive directory of official, federated, commercial, open-data, and community-built APIs and machine-readable data sources in Sri Lanka across 16 macro-sectors.

---

## Executive Summary

Sri Lanka's API ecosystem spans 16 distinct sectors. While a single monolithic government API gateway is still evolving under digital governance frameworks (such as the Digital Payment Infrastructure / SLUDI developer portal and SNGAPI proposals), the live data ecosystem is active across:
1. **CKAN Open Data Portals** (`data.gov.lk`, `data.health.gov.lk`)
2. **Unified Data Abstractions** (such as `@nuuuwan`'s `lanka_data` exposing Census, Elections, and Survey data)
3. **Federated Telecom Network APIs** (GSMA Open Gateway live across Dialog Axiata, SLT-Mobitel, Hutch, and Airtel covering 21M subscribers)
4. **Standardised API Banking & Interbank Payment Rails** (Sampath Bank Open Banking, Seylan Open API, Nations Trust Open API, LankaPay JustPay Web, and GovPay)
5. **Capital Markets & Financial Data** (Colombo Stock Exchange POST APIs at `cse.lk/api/`, CBSL indicative exchange rates, and macro indices)
6. **Location, Geo & Administrative Tools** (`slcities.live/api`, `location-api-sl`, postal code lookups, and NIC validators)
7. **Production-Ready News Scrapers & Global Aggregators** (Hiru News API, Esana News API v3, Ada Derana API, World News API, and GNews)

---

## 1. News & Media APIs

### 1.1 Commercial & Global Aggregators
Global news platforms providing Sri Lanka filters (`country=lk`, `source-country=lk`, `q=Sri Lanka`):

- **World News API**: `GET https://api.worldnewsapi.com/search-news?source-country=lk` — Monitors 15 LK news outlets, ~48 articles/day, historical archive from Jan 2022.
- **GNews API**: `GET https://gnews.io/api/v4/search?q=Sri%20Lanka&country=lk&lang=en` — Filter by `lang=en/si/ta`. Free tier 100 req/day.
- **Mediastack**: `GET http://api.mediastack.com/v1/news?countries=lk` — 500 req/month free tier.
- **NewsData.io**: `GET https://newsdata.io/api/1/news?country=lk` — 200 req/day free tier.
- **NewsAPI.org**: `GET https://newsapi.org/v2/everything?q=Sri%20Lanka` — 100 req/day dev tier.
- **ApiTube**: `GET https://api.apitube.io/v1/news?country=lk` — Historical archives back to 1998 with SDKs for Node, Python, PHP.
- **Currents API**: `GET https://api.currentsapi.services/v1/search?country=LK`
- **TheNewsAPI**: `GET https://api.thenewsapi.com/v1/news?locale=lk`

### 1.2 Sri Lanka-Specific Unofficial APIs (Scrapers & Proxies)
Community-built, production-ready REST services hosted on Vercel/Node:

- **Hiru News API** (`tharustack/Hiru-News-API`):
  - Base: `https://hirunews.vercel.app/api`
  - Endpoints: `/api/health`, `/api/breaking-news`, `/api/latest-news?limit=10`, `/api/article/{id}`, `/api/category/{sports|business|entertainment|general}`, `/api/date?date=YYYY-MM-DD`, `/api/search?q=term`
  - Features: Full-text extraction, thumbnails, word count, Sinhala & English toggle, CORS enabled.
- **Helakuru Esana News API v3** (`ThaminduDisnaZ/Esena-News-API-Sinhala-News-API` & `Damantha126/Helakuru-Esana-API`):
  - Endpoints: `https://esena-news-api-v3.vercel.app/` & `https://esana-api.vercel.app/EsanaV3`
  - Features: Live proxy for Helakuru Esana push JSON (`title`, `title_en`, `content`, `published`, `link`).
- **Ada Derana News API** (`nbdev-sl/AdaDerana-News-API`):
  - Base: `https://ada-derana-news-api.vercel.app/`
- **Media RSS Feeds**: Ada Derana (`adaderana.lk/rss.php`), Daily Mirror (`dailymirror.lk/rss`), EconomyNext (`economynext.com/feed`), Daily FT (`ft.lk/rss`), Sunday Times (`sundaytimes.lk/feed`), Lankadeepa, Virakesari.

---

## 2. Government Open Data & Public Sector APIs

### 2.1 National Open Data Portal — `data.gov.lk`
CKAN-based official portal exposing standard Action API endpoints:
- Base API: `https://data.gov.lk/api/3/action/`
- Data Catalog JSON: `https://data.gov.lk/data.json`
- Key Actions: `package_list`, `package_search?q=...`, `package_show?id=...`, `datastore_search?resource_id=...`
- Domains: Transport, Agriculture, IT, Demographics, Crime, Tourism.

### 2.2 Health Open Data Portal — `data.health.gov.lk`
CKAN-based health data portal:
- Base API: `https://data.health.gov.lk/api/3/action/`
- Actions: `package_search`, `package_list` for epidemiological surveillance, hospital statistics, and public health metrics.

### 2.3 Department of Agriculture API — `api.doa.gov.lk`
- Base API: `https://api.doa.gov.lk/v1`
- Endpoints: `/crops?access_key=YOUR_KEY`
- Features: Crop performance metrics, historical yield distributions, agronomic guidance, and weather observations.

### 2.4 Lanka Data Unified Interface — `@nuuuwan`
Unified command-line and HTTP abstraction over Census, Election Commission, and Survey Dept data:
- PyPI: `pip install lanka-data`
- HTTP Proxy: `https://lanka-data-phi.vercel.app/<Topic>/<Year>/<Region>:<Granularity>/<Visualization>`
- Example: `https://lanka-data-phi.vercel.app/Religion/2024/LK/Map`
- Datasets included: Census of Population & Housing (2012, 2024), Election Commission summary stats (valid/rejected votes), District/Province boundary topologies.

### 2.5 Parliament & Elections
- **Elections Commission Results**: `https://results.elections.gov.lk` and eServices `https://eservices.elections.gov.lk`.
- **ECLK / `lg_election_lk_2025`**: Community scrapers returning live turnouts, percentage released, and polling division breakdown graphs (`gig-nuuuwan`).
- **Parliament Hansard & Gazettes**: Scraped PDF archives at `documents.gov.lk` and `parliament.lk`.

### 2.6 Customs & Digital Economy
- **Customs ASYHUB**: Mandatory electronic manifest submission platform via UNCTAD ASYCUDA cloud-native architecture.
- **ICTA Lanka Gate & Digital Forms**: `forms.gov.lk` for real-time government service tracking, e-GP e-procurement system.

---

## 3. Financial, Stock Market & Macroeconomic APIs

### 3.1 Colombo Stock Exchange (CSE) — Unofficial REST Surface
- Base API: `https://www.cse.lk/api/` (HTTP POST)
- Core Endpoints:
  - `companyInfoSummery`: Accepts `{"symbol": "LOLC.N0000"}`, returns fundamentals and last price.
  - `tradeSummary` & `detailedTrades`: Real-time order execution metrics.
  - `todaySharePrice` & `companyChartDataByStock`: Intra-day price updates.
  - `topGainers`, `topLooses`, `mostActiveTrades`: Daily market performance.
  - `aspiData` & `snpData`: Live index tracking (ASPI, S&P SL20).
  - `marketStatus`, `marketSummery`, `allSectors`, `dailyMarketSummery`.
- Developer Wrappers: `cse-market-mcp-server` (MCP server for LLMs/Claude Code with TradingView technicals), PyPI `cse.lk`.

### 3.2 Central Bank of Sri Lanka (CBSL) & Forex
- Official Portal: `https://www.cbsl.gov.lk/cbsl_custom/param/ratewindow.php` (Daily TT buying/selling rates).
- Indicative FX Search: `https://www.cbsl.gov.lk/en/search/node/daily%20exchange%20rate`.
- Open FX Adapters: `fawazahmed0 currency-api` (USD/LKR mid-rate mirror), `Fluentax`, `LankaRates.com`.

### 3.3 Banking Open API Platforms
- **Sampath Bank Standardised API Banking** (`developer.sampath.lk`): First standardized open banking platform in Sri Lanka. Exposes OAuth2 REST endpoints for transaction banking, fund transfers, account information, and corporate ERP integration (CDB onboarded first).
- **Nations Trust Open API** (`openapi.nationstrust.com`): PSD2-compliant platform offering payment APIs, FriMi integration, and merchant POS tools.
- **Seylan Bank Open API**: Enables eChannelling real-time payments via LankaPay JustPay and Koko BNPL integration.
- **Commercial Bank, HNB, DFCC**: Private API stacks integrated via LankaPay CEFTS network.

### 3.4 Macroeconomic Data Feeds
- **World Bank API for Sri Lanka**: `https://api.worldbank.org/v2/country/LKA/indicator/NY.GDP.MKTP.CD?format=json` (GDP), `SP.POP.TOTL` (Population), `FP.CPI.TOTL.ZG` (Inflation).
- **FRED St. Louis Fed**: Hosts 50+ time-series indicators for Sri Lanka bank assets, credit-to-GDP, and interest rates (`fred.stlouisfed.org/tags/series?t=sri+lanka`).

---

## 4. Telecommunications & Network APIs (GSMA Open Gateway)

### 4.1 GSMA Open Gateway (Federated Across All 4 MNOs)
Sri Lanka was the world's first country to achieve 100% country-wide commercial launch of GSMA Open Gateway network APIs across **Dialog Axiata**, **SLT-Mobitel**, **Hutch**, and **Airtel Lanka** (covering 21 million subscribers):
- **Number Verification / OTP Validation API**: Silent network authentication (SNA) and operator-level OTP check.
- **Device Location API**: Cell-tower network location verification for fraud prevention and logistics.
- **Carrier Billing API**: Direct operator billing (DCB) for single-purchase and recurring subscriptions.

### 4.2 Dialog IdeaBiz & IdeaMart Platform
Dialog Axiata's enterprise API platform (`portal.ideabiz.lk` / `docs.ideabiz.lk`):
- Base: `https://ideabiz.lk/apicall/`
- APIs:
  - SMS Messaging: `/apicall/smsmessaging/v3/outbound/{port}/requests`
  - Carrier Billing / Payment: `/apicall/payment/v4/`
  - Subscription Manager & USSD: `/apicall/ussd/v3`
  - Header Enrichment & Device Location

### 4.3 Commercial SMS Gateways
- **Text.lk**: `https://text.lk/docs/api-endpoints-introduction/` (Bearer token auth, bulk SMS, OTP, MMS, WhatsApp API).
- **Notify.lk**: `GET/POST https://app.notify.lk/api/v1/send` (`user_id`, `api_key`, `sender_id`, `to`, `message`).
- **Richmo SMS**, **SMSAPI.LK**, **Dialog eSMS** (`e-sms.dialog.lk/api/v1`), **Hutch BSMS** (`bsms.hutch.lk`).

---

## 5. Payments, Fintech & GovPay Rails

### 5.1 LankaPay National Payment Switch
- **CEFTS (Common Electronic Fund Transfer Switch)**: Real-time interbank fund transfer system.
- **JustPay & JustPay Web**: Direct bank-account payment rail for mobile and web checkouts. Cost-efficient alternative to IPG. Flutter SDK `lankapay_justpay_flutter` exposes native payment channel hooks (`justpay_sdk/methods`).
- **LANKAQR**: Interoperable QR payment standard across 400,000+ merchants nationwide.

### 5.2 GovPay — Government Digital Payment Platform
- Joint initiative by Ministry of Digital Economy, ICTA, LankaPay, and CBSL (launched Feb 2025).
- Managed by LankaPay, powering payments across 215+ government institutions and 3,372 services (including island-wide digital traffic fine collection and 55,000 Dialog eZ Cash retail points).
- Exposes API-integrated interfaces for government department portals.

### 5.3 PayHere — CBSL-Authorized Payment Aggregator
- Central Bank-authorized payment aggregator supporting Visa, Mastercard, Amex, Discover, FriMi, Genie, eZ Cash, mCash, and Sampath Vishwa in LKR, USD, GBP, EUR, AUD.
- Documentation: `support.payhere.lk/api-&-mobile-sdk/`
- API Surface: Checkout API (`https://www.payhere.lk/pay/checkout`), Recurring API, Preapproval API, Charging API, Retrieval API, Subscription Manager API, Refund API, Authorize & Capture API.
- SDKs: React Native (`PayHereLK/payhere-mobilesdk-reactnative`), Node.js, Python (`apexkv/payhere-python`), Laravel.

### 5.4 WEBXPAY & Merchant Ecosystem
- **WEBXPAY**: Exposes XGATEWAY, XPOS, XSPLIT (installments), XQR, and Google Pay for e-commerce.

---

## 6. Transport, Aviation, Shipping & Logistics

### 6.1 Sri Lanka Railways
- **Sri Lanka Railways Location API** (`A-Samod/sri-lanka-railways-location-api`): Node.js + MongoDB backend ingesting live train GPS data with 90-day retention (`POST /location`, `GET /location/:trainId`, `GET /location/history/:trainId`).
- **Official Schedule & Seat Booking**: `eservices.railway.gov.lk/schedule/searchTrain.action` and `seatreservation.railway.gov.lk`.

### 6.2 Aviation — SriLankan Airlines & Bandaranaike International (CMB/VCBI)
- **Aviation Edge SriLankan Airlines API**:
  - Timetable: `https://aviation-edge.com/v2/public/timetable?key=KEY&iataCode=CMB&type=departure&airline_iata=UL`
  - Live Flights: `https://aviation-edge.com/v2/public/flights?key=KEY&flightIata=UL123`
  - Fleet Tracking: `airlineIata=UL&airlineIcao=ALK`
- **Bandaranaike International Airport (CMB) API**: Arrivals, departures, baggage belt, gate, delay status (`arrIata=CMB&arrIcao=VCBI`).

### 6.3 Maritime & Port of Colombo (LKCMB)
- **Port of Colombo (UN/LOCODE: LKCMB)**: 12M TEU capacity with VTMS AIS radar tracking.
- **SAGT e-Port**: Real-time vessel schedule and container status at South Asia Gateway Terminals (`searates.com/port/colombo_lk/port-schedule`).

---

## 7. Location, Administrative Divisions & Geospatial APIs

### 7.1 SLCities.live API — Modern Administrative Data
- Production Base: `https://slcities.live/api`
- OpenAPI Spec: `https://slcities.live/api-spec` (Swagger UI at `/api-docs`)
- Key Endpoints:
  - `/cities`: Complete listing of Sri Lankan cities with postal codes and coordinates.
  - `/cities/district/{districtName}`: District city filter.
  - `/cities/province/{provinceName}`: Province city filter.
  - `/cities/postcode/{postcode}`: Postcode lookup.
  - `/cities/nearby?lat=6.9271&lon=79.8612&radius=10`: Radius proximity search.
  - `/cities/search?q=Colombo&lang=en`: Search in English, Sinhala, or Tamil.
  - `/provinces`, `/districts`, `/districts/province/{provinceId}`, `/summary`.

### 7.2 Location-API-SL — Heroku Endpoint
- Production Base: `https://locatesrilanka.herokuapp.com/` (`PasinduS96/location-api-sl`)
- Endpoints: `/cities`, `/provinces`, `/districts`, `/cities/cordinates/{CITY}`, `/cities/byDistrict/{ID}`, `/cities/colombo_mca` (Colombo Municipal Council sub-wards).

### 7.3 Raw Datasets & Libraries
- `aslamanver/srilanka-cities`: MySQL dumps for Provinces → Districts → Cities in Sinhala, Tamil, and English.
- `madurapa/sri-lanka-provinces-districts-cities`: Trilingual JSON/SQL with postal codes, lat/lon.
- `srilankan-postalcode-backend`: NPM postal code validator and location extractor.

---

## 8. Weather, Disaster & Environmental Monitoring

### 8.1 Department of Meteorology — ArcGIS REST Portal
- GIS Server: `https://weather.meteo.gov.lk/server/rest/services`
- Services (`?f=pjson`):
  - `Forecast/monthly_rainfall_forecast_view/MapServer`
  - `seasonal_rainfall_forecast_view`
  - `monthly_max_temperature_forecast_view`
  - `Weather_Warning/Thunderstorm_and_Lighting/MapServer`

### 8.2 Open-Meteo & OpenAQ
- **Open-Meteo**: `GET https://api.open-meteo.com/v1/forecast?latitude=6.9271&longitude=79.8612&hourly=temperature_2m,precipitation&daily=temperature_2m_max&timezone=Asia/Colombo` — Free, keyless ERA5 historical & forecast model.
- **OpenAQ**: `GET https://api.openaq.org/v2/latest?country=LK` — Real-time air quality in Colombo and Kandy.
- **USGS & GDACS**: Real-time seismic and tsunami alert monitoring for Sri Lanka coordinates (`latitude=7.0&longitude=81.0&radius=500`).

---

## 9. Healthcare & Epidemiological Data

### 9.1 DHIS2 Health Information System (Ministry of Health)
- Core API: `https://{instance}/api` — Standard DHIS2 Web API powering national health surveillance.
- DHIS2 FHIR Gateway: Integrates HL7 FHIR payloads with DHIS2 core.
- Python SDK: `tobah59x/DHIS2Retrieval` for extracting health statistics.

### 9.2 `srilanka-epi` PyPI Package
- Python library (`pip install srilanka-epi`) that automatically downloads and parses Weekly Epidemiological Reports (WER) from the Epidemiology Unit (Ministry of Health).
- Extracts disease surveillance counts for Dengue, Leptospirosis, Typhoid, and COVID-19 across 333 MOH regions.

---

## 10. Education, AI & EdTech

- **BrainUs AI API** (`brainuslk/brainus-ai-api`): RAG-based search engine over Sri Lankan National Curriculum textbooks and syllabuses for Grades 1–13, returning citations and explanations.
- **BrainyBoost** (`Tharumika/BrainyBoost`): Quasar Vue.js + Supabase backend powering Sri Lankan A/L LMS and AI tutoring systems.
- **API Learning 101** (`api-learning.nisalgunawardhana.com`): RESTful demo platform for student profiles and course enrollments (`GET /api/users`).

---

## 11. Tourism, Hospitality & Travel

- **Travora 2.0 API** (`admin/app/api/`): Open-source backend for Sri Lankan attractions, tour itineraries, gallery assets, and vehicle rentals.
- **PearlPath API** (`PearlPath/pearlpath-api`): Backend for Smart Travel Platform using Node/Express/Supabase.
- **SLTDA Provider Directory**: `srilanka.travel/safe-and-secure` — Scraped directory of 2,000+ certified accommodation and tour operators.
- **ZentrumHub & Travelpayouts**: Hotel & flight distribution APIs normalized across Agoda, RateHawk, and Booking.com for Sri Lanka inventory.

---

## 12. Language, NLP & Vernacular Conversion

### 12.1 Phonetic Transliteration ("Singlish" to Sinhala Unicode)
- **`sinhala-unicode-converter`** (JS/NPM): Functions include `singlishToUnicode()`, `singlishPhoneticToUnicode()`, `tanglishToUnicode()`, `dlManelToUnicode()`, `fmAbayaToUnicode()`.
- **`sinhala_unicode_converter`** (Flutter/Dart): Flutter package for real-time Singlish typing in mobile applications.
- **`singlish-pro`** (NPM): Professional Singlish-to-Sinhala transliteration with intelligent Hal (`්`) consonant handling for React/Vue/Laravel.

### 12.2 Translation & Speech APIs
- **Google Cloud Speech-to-Text**: Language code `si-LK` for Sinhala (Sri Lanka) and `ta-LK` for Tamil.
- **Lingvanex Sinhala Translation API**: Neural Machine Translation REST service for Sinhala-English dictionary lookup and text translation.
- **Akuru GEN** (`ThaminduSulakshana/The-Akuru-GEN`): Rule-based Sinhala-English NLP translation engine.

---

## 13. Sports & Cricket APIs

- **Roanuz Cricket API** (`sports.dev.roanuz.com`):
  - GraphQL Endpoint: `https://api.sports.roanuz.com/v5/core/<PROJ_KEY>/graphql/`
  - Features: Ball-by-ball coverage, live scores, player statistics, run-rate graphs, and AI Chatbot API (`cricketapi.com/chatbot-api/`) for Sri Lanka national team and Lanka Premier League (LPL).
- **CricAPI / Cricsheet**: Free ball-by-ball historical datasets for Sri Lankan international fixtures.
- **Sportmonks Cricket API**: Live scoring and fantasy cricket statistics.

---

## 14. Citizen Identity & Holiday APIs

- **Sri Lanka Holidays API** (`Dilshan-H/srilanka-holidays`):
  - Base: `https://srilanka-holidays.vercel.app`
  - Endpoints: `GET /api/v1/holidays?year=2026&type=public|poya|bank|mercantile`, `GET /api/v1/check_holiday?year=2026&month=5&day=1`
  - Formats: JSON, CSV, XML, ICS calendar downloads sourced from Ministry of Home Affairs gazettes.
- **SL NIC API & Decoders**:
  - `Janith-Umeda/SL-NIC-API`: Base `https://slnic.iceiy.com/api/?nic=941234567V` — Returns format type (Old 9-digit / New 12-digit), Date of Birth, Gender, and Voting Eligibility.
  - `sl-nic-utils` (NPM) / `Ceylon-NIC-Engine` (Python): Pure client-side decoders.

---

## 15. Utilities & Energy Sector

- **CEB Care (Ceylon Electricity Board)**:
  - Portal: `https://cebcare.ceb.lk`
  - Endpoints: `GET https://cebcare.ceb.lk/Incognito/OutageMap` and `GetDemandMgmtClusters?LoadShedGroupId=A`
  - SMS Outage Verification: SMS account number to `1987` to receive automated power cut schedules.
- **National Fuel Pass**: `https://fuelpass.gov.lk` (Quota management portal).
- **Fuel Prices**: CPC (`cpc.lk`) & Lanka IOC (`lankaiocoil.lk`) retail petrol/diesel prices scraped via `fuelpass.lk`.

---

## 16. International Databases with High Sri Lanka Coverage

- **REST Countries**: `https://restcountries.com/v3.1/alpha/LK` (ISO codes, currency, capital, lat/lon).
- **World Bank Data**: `https://api.worldbank.org/v2/country/LKA/indicator/`
- **UN Comtrade / WITS**: `https://wits.worldbank.org/CountryProfile/en/Country/LKA` (Sri Lanka trade balance, imports/exports by country).
- **FAOSTAT**: `https://fenixservices.fao.org/faostat/api/v1/en/data/` (Paddy, tea, and coconut production in Sri Lanka).
- **ReliefWeb**: `https://api.reliefweb.int/v1/reports?query[value]=Sri%20Lanka` (Humanitarian crisis and disaster reports).
- **HDX (Humanitarian Data Exchange)**: `https://data.humdata.org/dataset?groups=lka` (133+ datasets on Sri Lanka crisis response).

---

## Summary of Live Production Endpoints for Quick Integration

| Service | Primary Live URL | Auth Required | Cache Recommendation |
| :--- | :--- | :--- | :--- |
| **Hiru News API** | `https://hirunews.vercel.app/api/latest-news` | None | 60s |
| **Esana News API v3** | `https://esena-news-api-v3.vercel.app/` | None | 60s |
| **SLCities Location API** | `https://slcities.live/api/cities` | None | 24h |
| **Lanka Data API** | `https://lanka-data-phi.vercel.app/` | None | 24h |
| **Sri Lanka Holidays API** | `https://srilanka-holidays.vercel.app/api/v1/holidays` | API Key / Public | 24h |
| **CSE Stock Market API** | `https://www.cse.lk/api/marketStatus` (POST) | Session Cookie | 30s |
| **Open-Meteo Weather** | `https://api.open-meteo.com/v1/forecast?latitude=6.9271&longitude=79.8612` | None | 30m |
| **OpenAQ Air Quality** | `https://api.openaq.org/v2/latest?country=LK` | None | 1h |
| **PayHere Checkout** | `https://www.payhere.lk/pay/checkout` | Merchant ID + HMAC | N/A (Form) |
| **Notify.lk SMS API** | `https://app.notify.lk/api/v1/send` | API Key | N/A (Action) |
