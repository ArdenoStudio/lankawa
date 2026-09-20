#!/usr/bin/env python3
"""Scaffold Cookie-Cat21-style unofficial API docs packages under api-docs/packages/."""
from __future__ import annotations

from pathlib import Path

import yaml

ROOT = Path("api-docs")

PACKAGES = [
    {
        "slug": "cse-api-docs-deepen",
        "tier": "A",
        "title": "CSE (cse.lk) API — deepen pack",
        "host": "https://www.cse.lk/api",
        "category": "markets",
        "status": "extend-existing",
        "summary": "Deepen Cookie-Cat21/cse-api-docs with topGainers, topLooses, 52WeekSectors, company announcements, GICS valuations.",
        "source_docs": ["docs/CSE_API_DOCS.md", "docs/CSE_UNUSED_ENDPOINTS_PROBE.md"],
    },
    {
        "slug": "combank-api-docs",
        "tier": "A",
        "title": "Commercial Bank API",
        "host": "https://www.combank.lk",
        "category": "banks",
        "status": "ready",
        "summary": "FX exchange-rates JSON, interest-rates-fd, rewards-promotions HTML.",
        "source_docs": ["docs/BANK_API_DEEP_DIVE_COMBANK.md", "docs/BANK_FD_API_SCHEMAS.md"],
    },
    {
        "slug": "hnb-venus-api-docs",
        "tier": "A",
        "title": "HNB Venus API",
        "host": "https://venus.hnb.lk/api",
        "category": "banks",
        "status": "ready",
        "summary": "~57 Venus paths: FX, card promos, interest rates tables, pawning.",
        "source_docs": ["docs/BANK_API_DEEP_DIVE_HNB.md"],
    },
    {
        "slug": "sampath-api-docs",
        "tier": "A",
        "title": "Sampath Bank API",
        "host": "https://www.sampath.lk",
        "category": "banks",
        "status": "ready",
        "summary": "exchange-rates TTBUY/TTSEL, rates-and-charges/external FD, card-promotions.",
        "source_docs": [
            "docs/BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md",
            "docs/BANK_FD_API_SCHEMAS.md",
        ],
    },
    {
        "slug": "seylan-api-docs",
        "tier": "A",
        "title": "Seylan Bank API",
        "host": "https://www.seylan.lk",
        "category": "banks",
        "status": "ready",
        "summary": "Per-currency FX JSON + get-fd-data deposit calculator.",
        "source_docs": ["docs/BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md"],
    },
    {
        "slug": "visa-lk-perks-api-docs",
        "tier": "A",
        "title": "Visa LK Perks API",
        "host": "https://www.visa.com.lk",
        "category": "cards",
        "status": "ready",
        "summary": "VMORC portal perks POST — supermarket/Glomark slice.",
        "source_docs": ["docs/BANK_API_DEEP_DIVE_VISA_SC_FDRATES.md"],
    },
    {
        "slug": "cbsl-public-data-docs",
        "tier": "A",
        "title": "CBSL Public Data",
        "host": "https://www.cbsl.gov.lk",
        "category": "macro",
        "status": "ready",
        "summary": "FX/gold scrapes, plrates OPR, eResearch IDs, payments bulletin PDFs.",
        "source_docs": ["docs/CBSL_RATES_API_DEEP_DIVE.md", "docs/CBSL_PAYMENTS_BULLETIN.md"],
    },
    {
        "slug": "cebcare-api-docs",
        "tier": "A",
        "title": "CEB Care API",
        "host": "https://cebcare.ceb.lk",
        "category": "utilities",
        "status": "ready",
        "summary": "DemandMgmtSchedule + GetDemandMgmtClusters antiforgery flow.",
        "source_docs": ["docs/CEB_DEMAND_MGMT_CLUSTERS.md"],
    },
    {
        "slug": "nwsdb-bill-api-docs",
        "tier": "A",
        "title": "NWSDB Bill Calculator API",
        "host": "https://ebis.waterboard.lk",
        "category": "utilities",
        "status": "ready",
        "summary": "POST BillCalculator domestic/Samurdhi tariffs.",
        "source_docs": ["docs/INTEGRATIONS.md"],
    },
    {
        "slug": "irrigation-arcgis-api-docs",
        "tier": "A",
        "title": "Irrigation ArcGIS Gauges",
        "host": "https://services3.arcgis.com",
        "category": "disaster",
        "status": "ready",
        "summary": "gauges_2_view FeatureServer + rainfall/flood siblings.",
        "source_docs": [
            "docs/EXISTING_APIS_UNUSED_ENDPOINTS.md",
            "docs/WEATHER_DISASTER_APIS_RESEARCH.md",
        ],
    },
    {
        "slug": "wfp-hdx-lka-food-docs",
        "tier": "A",
        "title": "WFP HDX Sri Lanka Food Prices",
        "host": "https://data.humdata.org",
        "category": "food",
        "status": "ready",
        "summary": "wfp_food_prices_lka.csv schema, lag, commodity mapping.",
        "source_docs": ["docs/FOOD_API_SOURCES.md"],
    },
    {
        "slug": "foodlk-api-docs",
        "tier": "A",
        "title": "FoodLK / Food Platform API",
        "host": "https://food-platform-backend.fly.dev",
        "category": "food",
        "status": "ready",
        "summary": "OpenAPI 41 paths; honest 500 vs live matrix.",
        "source_docs": ["docs/FOODLK_OPENAPI_EXHAUST.md", "docs/FOOD_API_SOURCES.md"],
    },
    {
        "slug": "sl-bank-card-offers-docs",
        "tier": "B",
        "title": "SL Bank Supermarket Card Offers",
        "host": "multi",
        "category": "cards",
        "status": "ready",
        "summary": "Multi-bank card days: Sampath/HNB/Visa JSON + HTML banks.",
        "source_docs": ["docs/CONSUMER_OFFERS_AND_DATA_SURVEY.md"],
    },
    {
        "slug": "sl-bank-remittance-tt-docs",
        "tier": "B",
        "title": "SL Bank Remittance TT Rates",
        "host": "multi",
        "category": "banks",
        "status": "ready",
        "summary": "9-bank USD TT board contracts (JSON + HTML).",
        "source_docs": ["docs/BANK_AND_API_UNIVERSE.md"],
    },
    {
        "slug": "sl-bank-fd-rates-docs",
        "tier": "B",
        "title": "SL Bank Fixed Deposit Rates",
        "host": "multi",
        "category": "banks",
        "status": "ready",
        "summary": "Unified FD compare schemas + HTML peers.",
        "source_docs": ["docs/BANK_FD_API_SCHEMAS.md", "docs/BANK_AND_API_UNIVERSE.md"],
    },
    {
        "slug": "metdept-cap-api-docs",
        "tier": "B",
        "title": "Met Dept CAP / Advisories",
        "host": "https://was.meteo.gov.lk",
        "category": "disaster",
        "status": "ready",
        "summary": "dashboard-api advisories + CAP RSS/XML.",
        "source_docs": ["docs/WEATHER_DISASTER_APIS_RESEARCH.md"],
    },
    {
        "slug": "open-meteo-lk-docs",
        "tier": "B",
        "title": "Open-Meteo Sri Lanka Recipes",
        "host": "https://api.open-meteo.com",
        "category": "weather",
        "status": "ready",
        "summary": "Colombo forecast, flood, marine, air-quality wrappers.",
        "source_docs": [
            "docs/OCTANE_OPENMETEO_UNUSED_PROBE.md",
            "docs/WEATHER_DISASTER_APIS_RESEARCH.md",
        ],
    },
    {
        "slug": "singer-emi-api-docs",
        "tier": "B",
        "title": "Singer Sri Lanka EMI API",
        "host": "https://www.singersl.com",
        "category": "retail",
        "status": "ready",
        "summary": "json-get-emi + json-get-single-emi household instalments.",
        "source_docs": ["docs/HOUSEHOLD_RETAIL_EMI_RESEARCH.md"],
    },
    {
        "slug": "octane-fuel-api-docs",
        "tier": "B",
        "title": "Octane Fuel API",
        "host": "https://octane-api.fly.dev",
        "category": "fuel",
        "status": "ready",
        "summary": "Sister Octane routes: prices, world compare, history.",
        "source_docs": ["docs/OCTANE_OPENMETEO_UNUSED_PROBE.md"],
    },
    {
        "slug": "ardeno-sister-backends-docs",
        "tier": "B",
        "title": "Ardeno Sister Backends",
        "host": "multi",
        "category": "platform",
        "status": "ready",
        "summary": "Life / Property / Vehicle / FoodLK Fly backends Lankawa consumes.",
        "source_docs": ["docs/INTEGRATIONS.md", "docs/FOODLK_OPENAPI_EXHAUST.md"],
    },
    {
        "slug": "nsb-rates-docs",
        "tier": "B",
        "title": "NSB Rates Pages",
        "host": "https://www.nsb.lk",
        "category": "banks",
        "status": "ready",
        "summary": "HTML deposit + FX TT under rates-tarriffs typo paths.",
        "source_docs": ["docs/BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md"],
    },
    {
        "slug": "dfcc-rates-docs",
        "tier": "B",
        "title": "DFCC Rates & Card Offers",
        "host": "https://www.dfcc.lk",
        "category": "banks",
        "status": "ready",
        "summary": "RSC-embedded rates + supermarket card hub HTML.",
        "source_docs": ["docs/BANK_API_DEEP_DIVE_BOC_PEOPLES_NDB_DFCC_PABC.md"],
    },
    {
        "slug": "boc-rates-docs",
        "tier": "B",
        "title": "Bank of Ceylon Rates",
        "host": "https://www.boc.lk",
        "category": "banks",
        "status": "ready",
        "summary": "rates-tariff HTML FX/FD; park stale FD JSON API.",
        "source_docs": ["docs/BANK_API_DEEP_DIVE_BOC_PEOPLES_NDB_DFCC_PABC.md"],
    },
    {
        "slug": "peoples-bank-rates-docs",
        "tier": "B",
        "title": "People's Bank Rates",
        "host": "https://www.peoplesbank.lk",
        "category": "banks",
        "status": "ready",
        "summary": "FX HTML TT + interest-rates HTML + card offer-cards.",
        "source_docs": ["docs/BANK_API_DEEP_DIVE_BOC_PEOPLES_NDB_DFCC_PABC.md"],
    },
    {
        "slug": "ndb-rates-docs",
        "tier": "B",
        "title": "NDB Rates",
        "host": "https://www.ndbbank.com",
        "category": "banks",
        "status": "ready",
        "summary": "exchange-rates + deposit interest HTML + card offers.",
        "source_docs": ["docs/BANK_API_DEEP_DIVE_BOC_PEOPLES_NDB_DFCC_PABC.md"],
    },
    {
        "slug": "pabc-card-offers-docs",
        "tier": "B",
        "title": "Pan Asia Bank Card Offers",
        "host": "https://www.pabc.com",
        "category": "cards",
        "status": "ready",
        "summary": "arr_offers JS after Sucuri cookie + senior FD HTML.",
        "source_docs": ["docs/AMANA_PABC_SDB_OFFERS_RESEARCH.md"],
    },
    {
        "slug": "ntb-amex-offers-docs",
        "tier": "B",
        "title": "NTB Mastercard + Amex Offers",
        "host": "multi",
        "category": "cards",
        "status": "ready",
        "summary": "NTB promotions/hub + americanexpress.lk supermarket-offers.",
        "source_docs": ["docs/NTB_SC_HSBC_OFFERS_RESEARCH.md"],
    },
    {
        "slug": "gdacs-firms-docs",
        "tier": "B",
        "title": "GDACS + NASA FIRMS",
        "host": "multi",
        "category": "disaster",
        "status": "ready",
        "summary": "GDACS events + FIRMS hotspot CSV for LK bbox.",
        "source_docs": ["docs/WEATHER_DISASTER_APIS_RESEARCH.md"],
    },
    {
        "slug": "leco-outages-docs",
        "tier": "B",
        "title": "LECO Outage Notices",
        "host": "https://www.leco.lk",
        "category": "utilities",
        "status": "ready",
        "summary": "Western/coastal LECO interruption notice scrape surfaces.",
        "source_docs": ["docs/INTEGRATIONS.md", "docs/WEATHER_DISASTER_APIS_RESEARCH.md"],
    },
    {
        "slug": "harti-cbsl-food-pdf-docs",
        "tier": "B",
        "title": "HARTI + CBSL Food Price PDFs",
        "host": "multi",
        "category": "food",
        "status": "ready",
        "summary": "Daily/weekly PDF indexes — civic fresh food (not supermarket JSON).",
        "source_docs": ["docs/HARTI_CBSL_FOOD_PDF.md"],
    },
]

CATEGORIES = {
    "banks": "Banks — FX, deposits, tariffs",
    "cards": "Card offers & perks",
    "macro": "CBSL / macro",
    "markets": "CSE / markets",
    "utilities": "Power & water",
    "disaster": "Weather & disaster",
    "weather": "Forecast & air quality",
    "food": "Food prices",
    "fuel": "Fuel / Octane",
    "retail": "Retail EMI",
    "platform": "Sister platforms",
}

ETHICS = """# Ethics & limits

- **Unofficial.** Not affiliated with the upstream operator.
- **Public reads only.** No credential stuffing, no captcha farms, no authenticated loyalty/OTP portals.
- **Polite rate limits.** Default ≥1s between probes; backoff on 429/403.
- **No PII in samples.** Redact phones, emails, addresses, account numbers.
- **Indicative data.** Not financial, medical, or legal advice.
- **Upstream ToS wins.** If a site bans scraping, park that surface and document why.
- **Server-side fetch preferred** for production consumers (CORS/WAF).
"""

PROBE_YML = """name: probe
on:
  schedule:
    - cron: "0 6 * * 1"
  push:
    branches: [main]
  workflow_dispatch:
jobs:
  probe:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: python scripts/probe.py
      - uses: actions/upload-artifact@v4
        with:
          name: probe-report
          path: |
            catalog/last_probe.json
            samples/
"""

PAGES_YML = """name: pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt && python scripts/build_site.py
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
"""

PROBE_PY = r'''#!/usr/bin/env python3
"""Minimal probe harness — replace stubs with live fetches per package."""
from __future__ import annotations

import json
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "catalog" / "endpoints.yaml"
SAMPLES = ROOT / "samples"
SAMPLES.mkdir(exist_ok=True)
UA = "LankawaApiDocsBot/1.0 (+https://github.com/ArdenoStudio/lankawa)"


def fetch(url: str, method: str = "GET", body: bytes | None = None, headers: dict | None = None):
    h = {"User-Agent": UA, "Accept": "application/json,*/*"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            return res.status, res.read().decode("utf-8", "replace")[:50_000]
    except Exception as e:  # noqa: BLE001
        return 0, str(e)


def main() -> None:
    data = yaml.safe_load(CATALOG.read_text())
    report = {"probed_at": datetime.now(timezone.utc).isoformat(), "results": []}
    for ep in data.get("endpoints", []):
        time.sleep(float(data.get("probe_delay_seconds", 1.0)))
        method = ep.get("method", "GET")
        url = ep["url"]
        body = None
        if ep.get("body_json") is not None:
            body = json.dumps(ep["body_json"]).encode()
        status, text = fetch(url, method=method, body=body, headers=ep.get("headers"))
        sample_path = SAMPLES / f"{ep['id']}.json"
        try:
            parsed = json.loads(text)
            sample_path.write_text(json.dumps(parsed, indent=2)[:20_000])
        except Exception:
            sample_path.write_text(text[:20_000])
        report["results"].append({"id": ep["id"], "status": status, "ok": 200 <= status < 300})
        print(ep["id"], status)
    (ROOT / "catalog" / "last_probe.json").write_text(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
'''

BUILD_SITE_PY = r'''#!/usr/bin/env python3
"""Build a tiny static index from catalog/endpoints.yaml."""
from __future__ import annotations

from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
SITE.mkdir(exist_ok=True)
data = yaml.safe_load((ROOT / "catalog" / "endpoints.yaml").read_text())
title = data.get("title", ROOT.name)
rows = []
for ep in data.get("endpoints", []):
    path = ep.get("path") or ep.get("url")
    rows.append(
        "<tr><td><code>{id}</code></td><td>{method}</td><td><code>{path}</code></td><td>{summary}</td></tr>".format(
            id=ep["id"],
            method=ep.get("method", "GET"),
            path=path,
            summary=ep.get("summary", ""),
        )
    )
html = """<!doctype html>
<html><head><meta charset="utf-8"><title>{title}</title>
<style>
body {{ font-family: system-ui, sans-serif; background: #0a0a0a; color: #f5f5f5; margin: 2rem; }}
table {{ border-collapse: collapse; width: 100%; }}
td, th {{ border: 1px solid #333; padding: 0.5rem; text-align: left; }}
a {{ color: #fff; }}
</style></head><body>
<h1>{title}</h1>
<p>Unofficial · not affiliated · live-probed staging package.</p>
<table>
<thead><tr><th>ID</th><th>Method</th><th>Path</th><th>Summary</th></tr></thead>
<tbody>
{rows}
</tbody>
</table>
</body></html>
""".format(title=title, rows="\n".join(rows))
(SITE / "index.html").write_text(html)
print("wrote", SITE / "index.html")
'''


def rich_endpoints(pkg: dict) -> list[dict]:
    """Known live endpoints for high-value packages (expand stubs)."""
    slug = pkg["slug"]
    if slug == "combank-api-docs":
        return [
            {
                "id": "exchange_rates",
                "method": "GET",
                "url": "https://www.combank.lk/api/exchange-rates",
                "path": "/api/exchange-rates",
                "summary": "Multi-currency TT/DD rates JSON (USD TT buy/sell).",
                "pagination": None,
            },
            {
                "id": "interest_rates_fd",
                "method": "GET",
                "url": "https://www.combank.lk/api/interest-rates-fd",
                "path": "/api/interest-rates-fd",
                "summary": "FD ladder array: paidIn, period (months), rate.",
                "pagination": None,
            },
            {
                "id": "rewards_promotions_html",
                "method": "GET",
                "url": "https://www.combank.lk/rewards-promotions",
                "path": "/rewards-promotions",
                "summary": "HTML rewards list (~72); supermarket DOW scrape.",
                "pagination": {"style": "html-list", "notes": "Full page list, not cursor pages"},
            },
        ]
    if slug == "sampath-api-docs":
        return [
            {
                "id": "exchange_rates",
                "method": "GET",
                "url": "https://www.sampath.lk/api/exchange-rates",
                "path": "/api/exchange-rates",
                "summary": "TTBUY/TTSEL FX JSON.",
            },
            {
                "id": "rates_and_charges_external",
                "method": "GET",
                "url": "https://www.sampath.lk/api/rates-and-charges/external",
                "path": "/api/rates-and-charges/external",
                "summary": "local.term_and_deposite FD slabs + savings.",
            },
            {
                "id": "card_promotions_super_markets",
                "method": "GET",
                "url": "https://www.sampath.lk/api/card-promotions?category=super_markets&page_number=1&size=20",
                "path": "/api/card-promotions",
                "summary": "Supermarket card offers JSON.",
                "pagination": {
                    "style": "page_number",
                    "params": {"page_number": "1-based", "size": "page size"},
                    "lab": True,
                },
            },
        ]
    if slug == "hnb-venus-api-docs":
        return [
            {
                "id": "get_exchange_rates_contents_web",
                "method": "GET",
                "url": "https://venus.hnb.lk/api/get_exchange_rates_contents_web",
                "path": "/get_exchange_rates_contents_web",
                "summary": "FX contents for web.",
            },
            {
                "id": "get_all_web_card_promos",
                "method": "GET",
                "url": "https://venus.hnb.lk/api/get_all_web_card_promos?page=1&limit=50&cardType=credit",
                "path": "/get_all_web_card_promos",
                "summary": "~841 card promos paginated.",
                "pagination": {
                    "style": "page_limit",
                    "params": {"page": "1-based", "limit": "default 50", "cardType": "credit|debit"},
                    "lab": True,
                },
            },
            {
                "id": "get_interest_rates_contents",
                "method": "GET",
                "url": "https://venus.hnb.lk/api/get_interest_rates_contents",
                "path": "/get_interest_rates_contents",
                "summary": "Nested FD/savings/loans tables in table_data_approved.",
            },
            {
                "id": "get_web_card_promo",
                "method": "GET",
                "url": "https://venus.hnb.lk/api/get_web_card_promo?id=1",
                "path": "/get_web_card_promo",
                "summary": "Single promo detail by id.",
            },
        ]
    if slug == "seylan-api-docs":
        return [
            {
                "id": "exchange_rates_usd",
                "method": "GET",
                "url": "https://www.seylan.lk/api/exchange-rates-get-value/USD",
                "path": "/api/exchange-rates-get-value/{CCY}",
                "summary": "Per-currency FX JSON.",
            },
            {
                "id": "get_fd_data",
                "method": "GET",
                "url": "https://www.seylan.lk/get-fd-data",
                "path": "/get-fd-data",
                "summary": "FD calculator JSON (Content-Type may lie text/html).",
            },
        ]
    if slug == "foodlk-api-docs":
        return [
            {
                "id": "openapi",
                "method": "GET",
                "url": "https://food-platform-backend.fly.dev/openapi.json",
                "path": "/openapi.json",
                "summary": "Full OpenAPI (41 paths).",
            },
            {
                "id": "hub_manifest",
                "method": "GET",
                "url": "https://food-platform-backend.fly.dev/api/v1/hub/manifest",
                "path": "/api/v1/hub/manifest",
                "summary": "Often 200 when hub/summary is 500.",
            },
            {
                "id": "hub_summary",
                "method": "GET",
                "url": "https://food-platform-backend.fly.dev/api/v1/hub/summary",
                "path": "/api/v1/hub/summary",
                "summary": "Preferred Lankawa surface — frequently 500.",
            },
            {
                "id": "basket_estimate",
                "method": "GET",
                "url": "https://food-platform-backend.fly.dev/api/v1/basket/estimate?preset=essentials",
                "path": "/api/v1/basket/estimate",
                "summary": "Essentials staples preset.",
                "pagination": None,
            },
        ]
    if slug == "cebcare-api-docs":
        return [
            {
                "id": "demand_mgmt_schedule",
                "method": "GET",
                "url": "https://cebcare.ceb.lk/Incognito/DemandMgmtSchedule",
                "path": "/Incognito/DemandMgmtSchedule",
                "summary": "HTML bootstrap for antiforgery token.",
            },
            {
                "id": "get_demand_mgmt_clusters",
                "method": "GET",
                "url": "https://cebcare.ceb.lk/Incognito/GetDemandMgmtClusters?LoadShedGroupId=A",
                "path": "/Incognito/GetDemandMgmtClusters",
                "summary": "Clusters for group A–Y; requires verification token.",
                "pagination": {
                    "style": "group_id",
                    "params": {"LoadShedGroupId": "A-Y"},
                    "lab": True,
                },
            },
        ]
    if slug == "nwsdb-bill-api-docs":
        return [
            {
                "id": "bill_calculator",
                "method": "POST",
                "url": "https://ebis.waterboard.lk/api_nwsdb/bill/BillCalculator",
                "path": "/api_nwsdb/bill/BillCalculator",
                "summary": "Domestic bill estimate.",
                "body_json": {
                    "CategoryId": 1,
                    "NoOfDays": 30,
                    "Consumption": 20,
                    "NoOfHouses": 1,
                },
            },
        ]
    if slug == "irrigation-arcgis-api-docs":
        return [
            {
                "id": "gauges_2_view_query",
                "method": "GET",
                "url": "https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/arcgis/rest/services/gauges_2_view/FeatureServer/0/query?where=1%3D1&outFields=*&orderByFields=EditDate%20DESC&resultRecordCount=50&f=json",
                "path": "/gauges_2_view/FeatureServer/0/query",
                "summary": "Latest river gauge readings.",
                "pagination": {
                    "style": "arcgis",
                    "params": {
                        "resultOffset": "offset",
                        "resultRecordCount": "page size (max ~1000)",
                    },
                    "lab": True,
                },
            },
        ]
    if slug == "cse-api-docs-deepen":
        return [
            {
                "id": "top_gainers",
                "method": "POST",
                "url": "https://www.cse.lk/api/topGainers",
                "path": "/topGainers",
                "body_json": {},
                "summary": "Dedicated top gainers board.",
            },
            {
                "id": "top_looses",
                "method": "POST",
                "url": "https://www.cse.lk/api/topLooses",
                "path": "/topLooses",
                "body_json": {},
                "summary": "Dedicated top losers (CSE spelling).",
            },
            {
                "id": "sector_52_week",
                "method": "POST",
                "url": "https://www.cse.lk/api/52WeekSectors",
                "path": "/52WeekSectors",
                "body_json": {},
                "summary": "52-week / YTD sector ranges.",
            },
            {
                "id": "trade_summary",
                "method": "POST",
                "url": "https://www.cse.lk/api/tradeSummary",
                "path": "/tradeSummary",
                "body_json": {},
                "summary": "Full board — primary poller; client-side page in lab.",
                "pagination": {
                    "style": "client_slice",
                    "params": {"offset": "client", "limit": "client"},
                    "lab": True,
                },
            },
        ]
    if slug == "visa-lk-perks-api-docs":
        return [
            {
                "id": "portal_perks",
                "method": "POST",
                "url": "https://www.visa.com.lk/offers/api/portal/portal/perks/",
                "path": "/offers/api/portal/portal/perks/",
                "summary": "VMORC perks; needs siteId + perkTypeRequests body.",
                "pagination": {
                    "style": "pageRequest",
                    "params": {"pageRequest.index": "0-based", "pageRequest.limit": "page size"},
                    "lab": True,
                },
            },
        ]
    if slug == "wfp-hdx-lka-food-docs":
        return [
            {
                "id": "wfp_food_prices_lka_csv",
                "method": "GET",
                "url": "https://data.humdata.org/dataset/0298c598-d312-4771-b564-f4ac4d831f05/resource/3638f0d6-9969-48cf-a919-1d879d037ec6/download/wfp_food_prices_lka.csv",
                "path": "/download/wfp_food_prices_lka.csv",
                "summary": "Full LKA CSV (~34k rows). Prefer _lka suffix.",
                "pagination": {
                    "style": "full_download",
                    "notes": "No server pagination — client chunk/filter",
                    "lab": True,
                },
            },
        ]
    if slug == "octane-fuel-api-docs":
        return [
            {
                "id": "prices_latest",
                "method": "GET",
                "url": "https://octane-api.fly.dev/v1/prices/latest",
                "path": "/v1/prices/latest",
                "summary": "Latest fuel prices.",
            },
            {
                "id": "comparison_world",
                "method": "GET",
                "url": "https://octane-api.fly.dev/v1/comparison/world",
                "path": "/v1/comparison/world",
                "summary": "World pump compare.",
            },
        ]
    if slug == "singer-emi-api-docs":
        return [
            {
                "id": "json_get_emi",
                "method": "GET",
                "url": "https://www.singersl.com/json-get-emi?product_id=7884&product_price=53699",
                "path": "/json-get-emi",
                "summary": "Multi-bank EMI rows for a SKU.",
            },
        ]
    if slug == "open-meteo-lk-docs":
        return [
            {
                "id": "forecast_colombo",
                "method": "GET",
                "url": "https://api.open-meteo.com/v1/forecast?latitude=6.9271&longitude=79.8612&daily=uv_index_max,precipitation_sum&timezone=Asia%2FColombo",
                "path": "/v1/forecast",
                "summary": "Colombo daily forecast.",
            },
            {
                "id": "air_quality_colombo",
                "method": "GET",
                "url": "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=6.9271&longitude=79.8612&hourly=pm2_5,us_aqi",
                "path": "/v1/air-quality",
                "summary": "Colombo air quality.",
            },
        ]
    # default placeholder
    host = pkg["host"] if str(pkg["host"]).startswith("http") else "https://example.invalid"
    return [
        {
            "id": "root_or_docs_stub",
            "method": "GET",
            "url": host,
            "path": "/",
            "summary": f"Stub — expand from {', '.join(pkg['source_docs'])}",
        }
    ]


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    (ROOT / "packages").mkdir(exist_ok=True)
    (ROOT / "shared").mkdir(exist_ok=True)

    index = {
        "version": 1,
        "title": "Sri Lanka unofficial API docs catalog (Lankawa staging)",
        "description": "Staging monorepo for Cookie-Cat21-style *-api-docs packages. Extract each package/ into its own public GitHub repo.",
        "pattern_repos": [
            "https://github.com/Cookie-Cat21/cse-api-docs",
            "https://github.com/Cookie-Cat21/ikman-api-docs",
        ],
        "tiers": {
            "A": "JSON / clear machine surfaces",
            "B": "HTML scrape contracts or multi-host packs",
        },
        "categories": CATEGORIES,
        "packages": PACKAGES,
    }
    (ROOT / "INDEX.yaml").write_text(yaml.dump(index, sort_keys=False, allow_unicode=True))
    (ROOT / "shared" / "ETHICS.md").write_text(ETHICS)

    for pkg in PACKAGES:
        base = ROOT / "packages" / pkg["slug"]
        for d in [
            "catalog",
            "samples",
            "docs",
            "examples",
            "scripts",
            "python",
            "site",
            ".github/workflows",
        ]:
            (base / d).mkdir(parents=True, exist_ok=True)
        (base / "docs" / "ETHICS.md").write_text(ETHICS)
        (base / "LICENSE").write_text(
            "MIT License — documentation and harness only. Upstream data remains subject to upstream terms.\n"
        )
        (base / "requirements.txt").write_text("PyYAML>=6\n")
        (base / ".github" / "workflows" / "probe.yml").write_text(PROBE_YML)
        (base / ".github" / "workflows" / "pages.yml").write_text(PAGES_YML)
        (base / "scripts" / "probe.py").write_text(PROBE_PY)
        (base / "scripts" / "build_site.py").write_text(BUILD_SITE_PY)
        (base / "examples" / "curl.md").write_text(
            f"# curl examples — {pkg['title']}\n\nSee `catalog/endpoints.yaml`.\n"
        )
        (base / "python" / "README.md").write_text(
            f"# Python helper — {pkg['slug']}\n\nThin wrappers to fill after extraction.\n"
        )
        (base / "PACKAGE.yaml").write_text(
            yaml.dump({**pkg, "extract_to": f"Cookie-Cat21/{pkg['slug']}"}, sort_keys=False)
        )
        endpoints_doc = {
            "title": pkg["title"],
            "host": pkg["host"],
            "tier": pkg["tier"],
            "category": pkg["category"],
            "probe_delay_seconds": 1.0,
            "ethics": "See docs/ETHICS.md",
            "source_docs_in_lankawa": pkg["source_docs"],
            "endpoints": rich_endpoints(pkg),
        }
        (base / "catalog" / "endpoints.yaml").write_text(
            yaml.dump(endpoints_doc, sort_keys=False, allow_unicode=True)
        )
        src_list = "\n".join(f"- `{s}`" for s in pkg["source_docs"])
        (base / "README.md").write_text(
            f"""# {pkg["title"]}

> Unofficial live-probed API documentation.
> **Not affiliated** with the upstream operator. Data may change without notice.

**Tier:** {pkg["tier"]} · **Category:** {pkg["category"]} · **Status:** {pkg["status"]}

{pkg["summary"]}

Pattern siblings: [cse-api-docs](https://github.com/Cookie-Cat21/cse-api-docs) · [ikman-api-docs](https://github.com/Cookie-Cat21/ikman-api-docs)

## Staging note

This package currently lives inside the Lankawa monorepo at `api-docs/packages/{pkg["slug"]}/`.
**Extract to** public repo `Cookie-Cat21/{pkg["slug"]}` using [`api-docs/EXTRACTION_PROMPT.md`](../../EXTRACTION_PROMPT.md).

## Source research (Lankawa)

{src_list}

## Layout

```
catalog/endpoints.yaml
samples/
scripts/probe.py
scripts/build_site.py
docs/ETHICS.md
examples/
python/
site/
```

## Quick start

```bash
cd api-docs/packages/{pkg["slug"]}
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python scripts/probe.py
python scripts/build_site.py
```

## License

MIT for docs/harness. Upstream data remains subject to upstream terms.
"""
        )

    print(f"scaffolded {len(PACKAGES)} packages")


if __name__ == "__main__":
    main()
