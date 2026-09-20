#!/usr/bin/env python3
"""Fill stub catalogs, add missed packages, emit app catalog JSON."""
from __future__ import annotations

import json
import shutil
from pathlib import Path

import yaml

ROOT = Path("api-docs")
ETHICS = (ROOT / "shared" / "ETHICS.md").read_text()

# Copy scaffolding helpers from an existing rich package
TEMPLATE = ROOT / "packages" / "combank-api-docs"


def write_endpoints(slug: str, title: str, host: str, tier: str, category: str, source_docs: list[str], endpoints: list[dict]):
    base = ROOT / "packages" / slug
    base.mkdir(parents=True, exist_ok=True)
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
    # Reuse harness from template if missing
    for rel in [
        "scripts/probe.py",
        "scripts/build_site.py",
        ".github/workflows/probe.yml",
        ".github/workflows/pages.yml",
        "requirements.txt",
        "LICENSE",
        "docs/ETHICS.md",
    ]:
        dst = base / rel
        if not dst.exists():
            src = TEMPLATE / rel
            if src.exists():
                dst.write_text(src.read_text())
            elif rel == "docs/ETHICS.md":
                dst.write_text(ETHICS)
    pkg = {
        "slug": slug,
        "tier": tier,
        "title": title,
        "host": host,
        "category": category,
        "status": "ready",
        "summary": title,
        "source_docs": source_docs,
        "extract_to": f"Cookie-Cat21/{slug}",
    }
    (base / "PACKAGE.yaml").write_text(yaml.dump(pkg, sort_keys=False, allow_unicode=True))
    doc = {
        "title": title,
        "host": host,
        "tier": tier,
        "category": category,
        "probe_delay_seconds": 1.0,
        "ethics": "See docs/ETHICS.md",
        "source_docs_in_lankawa": source_docs,
        "endpoints": endpoints,
    }
    (base / "catalog" / "endpoints.yaml").write_text(
        yaml.dump(doc, sort_keys=False, allow_unicode=True)
    )
    if not (base / "README.md").exists():
        src_list = "\n".join(f"- `{s}`" for s in source_docs)
        (base / "README.md").write_text(
            f"""# {title}

> Unofficial live-probed API documentation.
> **Not affiliated** with the upstream operator.

**Tier:** {tier} · **Category:** {category}

Staging path: `api-docs/packages/{slug}/` → extract to `Cookie-Cat21/{slug}`.

## Source research

{src_list}

## Quick start

```bash
cd api-docs/packages/{slug}
pip install -r requirements.txt
python scripts/probe.py
python scripts/build_site.py
```
"""
        )


FILLS: dict[str, list[dict]] = {
    "cbsl-public-data-docs": [
        {
            "id": "plrates_html",
            "method": "GET",
            "url": "https://www.cbsl.gov.lk/en/rates-and-indicators/policy-rates",
            "path": "/en/rates-and-indicators/policy-rates",
            "summary": "Policy rates page (OPR / corridor context).",
        },
        {
            "id": "historical_policy_xlsx",
            "method": "GET",
            "url": "https://www.cbsl.gov.lk/sites/default/files/cbslweb_documents/statistics/sheets/historical_policy_interest_rates.xlsx",
            "path": "/historical_policy_interest_rates.xlsx",
            "summary": "Historical SDFR/SLFR/OPR Excel tip.",
        },
        {
            "id": "eresearch_tbill_6169",
            "method": "GET",
            "url": "https://www.cbsl.gov.lk/eresearch/en_US/viewReport/6169",
            "path": "/eresearch/.../6169",
            "summary": "Secondary market T-bill yields (91/182/364).",
        },
        {
            "id": "eresearch_awpr_6277",
            "method": "GET",
            "url": "https://www.cbsl.gov.lk/eresearch/en_US/viewReport/6277",
            "path": "/eresearch/.../6277",
            "summary": "Weekly AWPR series.",
        },
        {
            "id": "payments_bulletin_index",
            "method": "GET",
            "url": "https://www.cbsl.gov.lk/en/payments-and-settlements/payments-bulletin",
            "path": "/en/payments-and-settlements/payments-bulletin",
            "summary": "Payments bulletin PDF index.",
        },
        {
            "id": "fx_buying_selling_html",
            "method": "GET",
            "url": "https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates",
            "path": "/en/rates-and-indicators/exchange-rates",
            "summary": "CBSL indicative FX HTML tables.",
        },
    ],
    "nsb-rates-docs": [
        {
            "id": "deposit_rates_html",
            "method": "GET",
            "url": "https://www.nsb.lk/rates-tarriffs/deposit-rates/",
            "path": "/rates-tarriffs/deposit-rates/",
            "summary": "Deposit rates HTML (note path typo tarriffs).",
        },
        {
            "id": "exchange_rates_html",
            "method": "GET",
            "url": "https://www.nsb.lk/rates-tarriffs/exchange-rates/",
            "path": "/rates-tarriffs/exchange-rates/",
            "summary": "FX TT HTML board.",
        },
    ],
    "dfcc-rates-docs": [
        {
            "id": "interest_rates_page",
            "method": "GET",
            "url": "https://www.dfcc.lk/interest-rates/",
            "path": "/interest-rates/",
            "summary": "RSC-embedded deposit/loan rates.",
        },
        {
            "id": "exchange_rates_page",
            "method": "GET",
            "url": "https://www.dfcc.lk/exchange-rates/",
            "path": "/exchange-rates/",
            "summary": "FX rates page.",
        },
        {
            "id": "card_offers_supermarket",
            "method": "GET",
            "url": "https://www.dfcc.lk/personal/cards/card-offers/",
            "path": "/personal/cards/card-offers/",
            "summary": "Card offers hub (supermarket DOW scrape).",
        },
    ],
    "boc-rates-docs": [
        {
            "id": "rates_tariff_html",
            "method": "GET",
            "url": "https://www.boc.lk/rates-tariff",
            "path": "/rates-tariff",
            "summary": "Canonical FX + FD HTML — prefer over stale JSON.",
        },
        {
            "id": "interest_rates_fd_json_parked",
            "method": "GET",
            "url": "https://www.boc.lk/api/interest-rates-fd",
            "path": "/api/interest-rates-fd",
            "summary": "PARK — live JSON but wrong vs rates-tariff HTML.",
            "status": "parked",
        },
    ],
    "peoples-bank-rates-docs": [
        {
            "id": "exchange_rates_html",
            "method": "GET",
            "url": "https://www.peoplesbank.lk/exchange-rates/",
            "path": "/exchange-rates/",
            "summary": "FX TT HTML.",
        },
        {
            "id": "interest_rates_html",
            "method": "GET",
            "url": "https://www.peoplesbank.lk/interest-rates/",
            "path": "/interest-rates/",
            "summary": "Deposit/loan interest HTML.",
        },
        {
            "id": "offer_cards",
            "method": "GET",
            "url": "https://www.peoplesbank.lk/card-offers/",
            "path": "/card-offers/",
            "summary": "Card offer listing HTML.",
        },
    ],
    "ndb-rates-docs": [
        {
            "id": "exchange_rates",
            "method": "GET",
            "url": "https://www.ndbbank.com/rates-and-tariffs/exchange-rates",
            "path": "/rates-and-tariffs/exchange-rates",
            "summary": "FX rates HTML.",
        },
        {
            "id": "deposit_interest",
            "method": "GET",
            "url": "https://www.ndbbank.com/rates-and-tariffs/interest-rates-for-deposits",
            "path": "/rates-and-tariffs/interest-rates-for-deposits",
            "summary": "Deposit interest HTML.",
        },
        {
            "id": "card_offers",
            "method": "GET",
            "url": "https://www.ndbbank.com/cards/offers",
            "path": "/cards/offers",
            "summary": "Card offers HTML.",
        },
    ],
    "pabc-card-offers-docs": [
        {
            "id": "card_offers_js",
            "method": "GET",
            "url": "https://www.pabc.com/personal/cards/offers",
            "path": "/personal/cards/offers",
            "summary": "Offers page; arr_offers JS after Sucuri cookie.",
            "pagination": {"style": "client_array", "lab": True, "notes": "Parse arr_offers after WAF cookie"},
        },
        {
            "id": "senior_fd_html",
            "method": "GET",
            "url": "https://www.pabc.com/personal/deposits/senior-citizens-fixed-deposit",
            "path": "/personal/deposits/senior-citizens-fixed-deposit",
            "summary": "Senior FD HTML (main ladder may be PDF-only).",
        },
    ],
    "ntb-amex-offers-docs": [
        {
            "id": "ntb_promotions_hub",
            "method": "GET",
            "url": "https://www.ntb.lk/personal/cards/promotions",
            "path": "/personal/cards/promotions",
            "summary": "NTB card promotions hub HTML.",
        },
        {
            "id": "amex_supermarket_offers",
            "method": "GET",
            "url": "https://www.americanexpress.lk/en-lk/benefits/consumer/supermarket-offers/",
            "path": "/benefits/consumer/supermarket-offers/",
            "summary": "Amex LK supermarket offers HTML.",
        },
    ],
    "gdacs-firms-docs": [
        {
            "id": "gdacs_events_rss",
            "method": "GET",
            "url": "https://www.gdacs.org/xml/rss.xml",
            "path": "/xml/rss.xml",
            "summary": "GDACS multi-hazard RSS.",
        },
        {
            "id": "firms_csv_lk",
            "method": "GET",
            "url": "https://firms.modaps.eosdis.nasa.gov/api/area/csv/DEMO_KEY/VIIRS_SNPP_NRT/79,5.5,82,10/1",
            "path": "/api/area/csv/.../VIIRS_SNPP_NRT/{bbox}/{days}",
            "summary": "FIRMS hotspot CSV for LK bbox (needs MAP_KEY).",
            "pagination": {"style": "time_window", "params": {"days": "1-10"}, "lab": True},
        },
    ],
    "leco-outages-docs": [
        {
            "id": "interruption_notices",
            "method": "GET",
            "url": "https://www.leco.lk/pages_e.php?id=45",
            "path": "/pages_e.php?id=45",
            "summary": "LECO interruption notices HTML.",
        },
    ],
    "harti-cbsl-food-pdf-docs": [
        {
            "id": "harti_daily_prices_index",
            "method": "GET",
            "url": "https://www.harti.gov.lk/index.php/en/market-information/daily-prices",
            "path": "/market-information/daily-prices",
            "summary": "HARTI daily price PDF index.",
        },
        {
            "id": "cbsl_weekly_food",
            "method": "GET",
            "url": "https://www.cbsl.gov.lk/en/statistics/economic-indicators",
            "path": "/en/statistics/economic-indicators",
            "summary": "CBSL food/economic indicator PDF entry points.",
        },
    ],
    "metdept-cap-api-docs": [
        {
            "id": "cap_en_rss",
            "method": "GET",
            "url": "https://www.meteo.gov.lk/images/XML/cap_en.xml",
            "path": "/images/XML/cap_en.xml",
            "summary": "CAP English warnings RSS/XML.",
        },
        {
            "id": "cap_si_rss",
            "method": "GET",
            "url": "https://www.meteo.gov.lk/images/XML/cap_si.xml",
            "path": "/images/XML/cap_si.xml",
            "summary": "CAP Sinhala warnings.",
        },
        {
            "id": "cap_ta_rss",
            "method": "GET",
            "url": "https://www.meteo.gov.lk/images/XML/cap_ta.xml",
            "path": "/images/XML/cap_ta.xml",
            "summary": "CAP Tamil warnings.",
        },
    ],
    "sl-bank-card-offers-docs": [
        {
            "id": "pack_overview",
            "method": "GET",
            "url": "https://www.sampath.lk/api/card-promotions?category=super_markets&page_number=1&size=20",
            "path": "(multi-host pack)",
            "summary": "Aggregator pack: Sampath + HNB Venus + ComBank HTML + peers → supermarket DOW.",
            "pagination": {"style": "multi_host", "lab": True, "notes": "See sibling bank packages for per-host pagination"},
        },
    ],
    "sl-bank-remittance-tt-docs": [
        {
            "id": "pack_overview",
            "method": "GET",
            "url": "https://www.combank.lk/api/exchange-rates",
            "path": "(multi-host pack)",
            "summary": "Aggregator: ComBank/Sampath/HNB/Seylan/NSB/DFCC/BOC/People's/NDB TT boards.",
            "pagination": None,
        },
    ],
    "sl-bank-fd-rates-docs": [
        {
            "id": "pack_overview",
            "method": "GET",
            "url": "https://www.combank.lk/api/interest-rates-fd",
            "path": "(multi-host pack)",
            "summary": "Aggregator: ComBank/Sampath/Seylan/HNB FD JSON → unified ladder.",
            "pagination": None,
        },
    ],
    "ardeno-sister-backends-docs": [
        {
            "id": "foodlk_openapi",
            "method": "GET",
            "url": "https://food-platform-backend.fly.dev/openapi.json",
            "path": "food-platform-backend.fly.dev/openapi.json",
            "summary": "FoodLK OpenAPI.",
        },
        {
            "id": "octane_prices",
            "method": "GET",
            "url": "https://octane-api.fly.dev/v1/prices/latest",
            "path": "octane-api.fly.dev/v1/prices/latest",
            "summary": "Octane latest prices.",
        },
        {
            "id": "life_health",
            "method": "GET",
            "url": "https://life-platform-api.fly.dev/health",
            "path": "life-platform-api.fly.dev/health",
            "summary": "Life platform health (host may vary).",
        },
    ],
    # enrich already-rich packages with extra siblings
    "irrigation-arcgis-api-docs": [
        {
            "id": "gauges_2_view_query",
            "method": "GET",
            "url": "https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/arcgis/rest/services/gauges_2_view/FeatureServer/0/query?where=1%3D1&outFields=*&orderByFields=EditDate%20DESC&resultRecordCount=50&f=json",
            "path": "/gauges_2_view/FeatureServer/0/query",
            "summary": "Latest river gauge readings.",
            "pagination": {
                "style": "arcgis",
                "params": {"resultOffset": "offset", "resultRecordCount": "page size"},
                "lab": True,
            },
        },
        {
            "id": "rainfall_24hr",
            "method": "GET",
            "url": "https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/arcgis/rest/services/24hr_rainfall/FeatureServer/0/query?where=1%3D1&outFields=*&resultRecordCount=50&f=json",
            "path": "/24hr_rainfall/FeatureServer/0/query",
            "summary": "24-hour rainfall FeatureServer.",
            "pagination": {"style": "arcgis", "lab": True},
        },
    ],
    "nwsdb-bill-api-docs": [
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
        {
            "id": "get_tariff_adjustment",
            "method": "GET",
            "url": "https://ebis.waterboard.lk/api_nwsdb/bill/getTariffAdjustment",
            "path": "/api_nwsdb/bill/getTariffAdjustment",
            "summary": "Tariff adjustment metadata.",
        },
    ],
    "singer-emi-api-docs": [
        {
            "id": "json_get_emi",
            "method": "GET",
            "url": "https://www.singersl.com/json-get-emi?product_id=7884&product_price=53699",
            "path": "/json-get-emi",
            "summary": "Multi-bank EMI rows for a SKU.",
        },
    ],
    "visa-lk-perks-api-docs": [
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
            "body_json": {
                "siteId": "www.visa.com.lk",
                "pageRequest": {"index": 0, "limit": 20},
            },
        },
    ],
    "wfp-hdx-lka-food-docs": [
        {
            "id": "wfp_food_prices_lka_csv",
            "method": "GET",
            "url": "https://data.humdata.org/dataset/0298c598-d312-4771-b564-f4ac4d831f05/resource/3638f0d6-9969-48cf-a919-1d879d037ec6/download/wfp_food_prices_lka.csv",
            "path": "/download/wfp_food_prices_lka.csv",
            "summary": "Full LKA CSV (~34k rows).",
            "pagination": {
                "style": "full_download",
                "notes": "No server pagination — client chunk/filter",
                "lab": True,
            },
        },
    ],
}

# Missed packages discovered from research docs / universe parks
MISSED = [
    {
        "slug": "amana-union-cargills-bank-docs",
        "tier": "B",
        "title": "Amana / Union / Cargills Bank rates & offers",
        "host": "multi",
        "category": "banks",
        "source_docs": ["docs/BANK_API_DEEP_DIVE_NTB_AMANA_UNION_CARGILLS.md"],
        "endpoints": [
            {
                "id": "amana_rates",
                "method": "GET",
                "url": "https://www.amanabank.lk/rates/",
                "path": "amanabank.lk/rates/",
                "summary": "Amana rates pages (Islamic products).",
            },
            {
                "id": "union_bank_offers",
                "method": "GET",
                "url": "https://www.unionb.com/personal/cards/offers",
                "path": "unionb.com/.../offers",
                "summary": "Union Bank card offers HTML.",
            },
            {
                "id": "cargills_bank_rates",
                "method": "GET",
                "url": "https://www.cargillsbank.com/rates-and-tariffs/",
                "path": "cargillsbank.com/rates-and-tariffs/",
                "summary": "Cargills Bank rates & tariffs.",
            },
        ],
    },
    {
        "slug": "sc-hsbc-offers-park-docs",
        "tier": "B",
        "title": "Standard Chartered + HSBC LK offers (park notes)",
        "host": "multi",
        "category": "cards",
        "source_docs": ["docs/NTB_SC_HSBC_OFFERS_RESEARCH.md", "docs/BANK_API_DEEP_DIVE_VISA_SC_FDRATES.md"],
        "endpoints": [
            {
                "id": "sc_tgl_offers_json_parked",
                "method": "GET",
                "url": "https://www.sc.com/lk/offers.json",
                "path": "/lk/offers.json",
                "summary": "PARK — TGL offers.json mostly expired on probe.",
                "status": "parked",
            },
            {
                "id": "hsbc_retail_parked",
                "method": "GET",
                "url": "https://www.hsbc.lk/",
                "path": "/",
                "summary": "PARK — HSBC LK retail sold to NTB; offer URLs dead.",
                "status": "parked",
            },
        ],
    },
    {
        "slug": "lk-flood-api-docs",
        "tier": "A",
        "title": "lk-flood-api (nuuuwan)",
        "host": "https://nuuuwan.github.io",
        "category": "disaster",
        "source_docs": ["docs/WEATHER_DISASTER_APIS_RESEARCH.md", "docs/EXISTING_APIS_UNUSED_ENDPOINTS.md"],
        "endpoints": [
            {
                "id": "flood_latest",
                "method": "GET",
                "url": "https://raw.githubusercontent.com/nuuuwan/lk_flood/data/lk_flood.json",
                "path": "/lk_flood.json",
                "summary": "Flood station levels JSON used by Lankawa flood adapter.",
            },
        ],
    },
    {
        "slug": "litro-laugfs-lpg-docs",
        "tier": "B",
        "title": "Litro + LAUGFS LPG price pages",
        "host": "multi",
        "category": "fuel",
        "source_docs": ["docs/INTEGRATIONS.md", "docs/EXISTING_APIS_UNUSED_ENDPOINTS.md"],
        "endpoints": [
            {
                "id": "litro_prices",
                "method": "GET",
                "url": "https://litrogas.com/",
                "path": "litrogas.com/",
                "summary": "Litro cylinder price HTML scrape surface.",
            },
            {
                "id": "laugfs_prices",
                "method": "GET",
                "url": "https://www.laugfs.lk/",
                "path": "laugfs.lk/",
                "summary": "LAUGFS LPG price HTML.",
            },
        ],
    },
    {
        "slug": "promise-lk-tenders-docs",
        "tier": "B",
        "title": "Promise.lk tenders",
        "host": "https://promise.lk",
        "category": "platform",
        "source_docs": ["docs/INTEGRATIONS.md"],
        "endpoints": [
            {
                "id": "procurements_list",
                "method": "GET",
                "url": "https://promise.lk/",
                "path": "/",
                "summary": "Public procurement listings (scrape/API as probed).",
                "pagination": {"style": "html_list", "lab": True},
            },
        ],
    },
    {
        "slug": "openaq-lk-docs",
        "tier": "A",
        "title": "OpenAQ Sri Lanka",
        "host": "https://api.openaq.org",
        "category": "weather",
        "source_docs": ["docs/WEATHER_DISASTER_APIS_RESEARCH.md", "docs/EXISTING_APIS_UNUSED_ENDPOINTS.md"],
        "endpoints": [
            {
                "id": "locations_lk",
                "method": "GET",
                "url": "https://api.openaq.org/v3/locations?countries_id=207&limit=100",
                "path": "/v3/locations",
                "summary": "LK monitoring locations (country id may change).",
                "pagination": {
                    "style": "limit_page",
                    "params": {"limit": "page size", "page": "1-based"},
                    "lab": True,
                },
            },
        ],
    },
    {
        "slug": "softlogic-emi-park-docs",
        "tier": "B",
        "title": "Softlogic EMI (park — heavy crawl)",
        "host": "https://www.softlogic.lk",
        "category": "retail",
        "source_docs": ["docs/BANK_AND_API_UNIVERSE.md"],
        "endpoints": [
            {
                "id": "variation_detail_parked",
                "method": "GET",
                "url": "https://www.softlogic.lk/",
                "path": "/variation-detail/{id}",
                "summary": "PARK — per-SKU EMI crawl too heavy vs Singer json-get-emi.",
                "status": "parked",
            },
        ],
    },
    {
        "slug": "mypromo-park-docs",
        "tier": "B",
        "title": "MyPromo.lk (park — ToS)",
        "host": "https://mypromo.lk",
        "category": "cards",
        "source_docs": ["docs/BANK_AND_API_UNIVERSE.md", "docs/CONSUMER_OFFERS_AND_DATA_SURVEY.md"],
        "endpoints": [
            {
                "id": "mypromo_parked",
                "method": "GET",
                "url": "https://mypromo.lk/",
                "path": "/",
                "summary": "PARK — ToS bans scrape; prefer bank first-party.",
                "status": "parked",
            },
        ],
    },
    {
        "slug": "sdb-rates-docs",
        "tier": "B",
        "title": "SANASA Development Bank rates",
        "host": "https://www.sdb.lk",
        "category": "banks",
        "source_docs": ["docs/AMANA_PABC_SDB_OFFERS_RESEARCH.md"],
        "endpoints": [
            {
                "id": "rates_page",
                "method": "GET",
                "url": "https://www.sdb.lk/rates/",
                "path": "/rates/",
                "summary": "SDB rates HTML surfaces.",
            },
        ],
    },
    {
        "slug": "gold-retail-rates-docs",
        "tier": "B",
        "title": "Gold retail rates research pack",
        "host": "multi",
        "category": "macro",
        "source_docs": ["docs/GOLD_RETAIL_RATES_RESEARCH.md", "docs/CBSL_RATES_API_DEEP_DIVE.md"],
        "endpoints": [
            {
                "id": "cbsl_gold_page",
                "method": "GET",
                "url": "https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates",
                "path": "(see GOLD_RETAIL_RATES_RESEARCH.md)",
                "summary": "CBSL + jeweller retail gold scrape notes.",
            },
        ],
    },
]


def apply_fill(slug: str, endpoints: list[dict]) -> None:
    path = ROOT / "packages" / slug / "catalog" / "endpoints.yaml"
    if not path.exists():
        print("missing package", slug)
        return
    data = yaml.safe_load(path.read_text())
    data["endpoints"] = endpoints
    path.write_text(yaml.dump(data, sort_keys=False, allow_unicode=True))
    print("filled", slug, len(endpoints))


def rebuild_index() -> None:
    packages = []
    for pkg_dir in sorted((ROOT / "packages").iterdir()):
        if not pkg_dir.is_dir():
            continue
        meta_path = pkg_dir / "PACKAGE.yaml"
        ep_path = pkg_dir / "catalog" / "endpoints.yaml"
        if not meta_path.exists() or not ep_path.exists():
            continue
        meta = yaml.safe_load(meta_path.read_text())
        ep = yaml.safe_load(ep_path.read_text())
        endpoints = ep.get("endpoints", [])
        lab = [
            e["id"]
            for e in endpoints
            if isinstance(e.get("pagination"), dict) and e["pagination"].get("lab")
        ]
        packages.append(
            {
                **{k: meta[k] for k in ("slug", "tier", "title", "host", "category", "status", "summary") if k in meta},
                "source_docs": meta.get("source_docs", []),
                "extract_to": meta.get("extract_to", f"Cookie-Cat21/{meta['slug']}"),
                "endpoint_count": len(endpoints),
                "pagination_lab": lab,
                "endpoints": [
                    {
                        "id": e.get("id"),
                        "method": e.get("method", "GET"),
                        "path": e.get("path") or e.get("url"),
                        "url": e.get("url"),
                        "summary": e.get("summary", ""),
                        "status": e.get("status", "live"),
                        "pagination": e.get("pagination"),
                        "body_json": e.get("body_json"),
                    }
                    for e in endpoints
                ],
            }
        )

    categories = {
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
        "categories": categories,
        "package_count": len(packages),
        "packages": packages,
    }
    (ROOT / "INDEX.yaml").write_text(yaml.dump(index, sort_keys=False, allow_unicode=True))

    # App-facing JSON (no PyYAML at runtime)
    app_json = Path("src/lib/api-docs-catalog.json")
    app_json.write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n")
    print("wrote", ROOT / "INDEX.yaml", "packages=", len(packages))
    print("wrote", app_json)


def main() -> None:
    for slug, endpoints in FILLS.items():
        apply_fill(slug, endpoints)
    for m in MISSED:
        write_endpoints(
            m["slug"],
            m["title"],
            m["host"],
            m["tier"],
            m["category"],
            m["source_docs"],
            m["endpoints"],
        )
        print("added missed", m["slug"])
    rebuild_index()


if __name__ == "__main__":
    main()
