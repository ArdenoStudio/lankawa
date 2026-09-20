#!/usr/bin/env python3
"""Build api-docs field coverage matrices (YAML + Markdown + app JSON)."""
from __future__ import annotations

import json
from pathlib import Path

import yaml

ROOT = Path("api-docs")
OUT_YAML = ROOT / "FIELD_COVERAGE_MATRIX.yaml"
OUT_MD = ROOT / "FIELD_COVERAGE_MATRIX.md"
OUT_JSON = Path("src/lib/api-docs-field-coverage.json")

# Coverage codes: Y = full machine field, P = partial/scrape/derived, N = absent, K = park/skip
# Domains use canonical Lankawa snapshot field names.

DOMAINS = {
    "fx_tt": {
        "title": "FX / remittance TT (USD→LKR)",
        "canonical": [
            "buyLkr",
            "sellLkr",
            "asOf",
            "spreadLkr",
            "currency",
            "ttBuy",
            "ttSell",
            "ddBuy",
            "ddSell",
            "chequeBuy",
            "chequeSell",
        ],
        "rows": {
            "combank-api-docs": {
                "buyLkr": "Y",
                "sellLkr": "Y",
                "asOf": "P",
                "spreadLkr": "P",
                "currency": "Y",
                "ttBuy": "Y",
                "ttSell": "Y",
                "ddBuy": "Y",
                "ddSell": "Y",
                "chequeBuy": "P",
                "chequeSell": "P",
            },
            "sampath-api-docs": {
                "buyLkr": "Y",
                "sellLkr": "Y",
                "asOf": "P",
                "spreadLkr": "P",
                "currency": "Y",
                "ttBuy": "Y",
                "ttSell": "Y",
                "ddBuy": "N",
                "ddSell": "N",
                "chequeBuy": "N",
                "chequeSell": "N",
            },
            "hnb-venus-api-docs": {
                "buyLkr": "Y",
                "sellLkr": "Y",
                "asOf": "Y",
                "spreadLkr": "P",
                "currency": "Y",
                "ttBuy": "Y",
                "ttSell": "Y",
                "ddBuy": "N",
                "ddSell": "N",
                "chequeBuy": "N",
                "chequeSell": "N",
            },
            "seylan-api-docs": {
                "buyLkr": "Y",
                "sellLkr": "Y",
                "asOf": "N",
                "spreadLkr": "P",
                "currency": "Y",
                "ttBuy": "Y",
                "ttSell": "Y",
                "ddBuy": "N",
                "ddSell": "N",
                "chequeBuy": "N",
                "chequeSell": "N",
            },
            "nsb-rates-docs": {
                "buyLkr": "P",
                "sellLkr": "P",
                "asOf": "P",
                "spreadLkr": "P",
                "currency": "P",
                "ttBuy": "P",
                "ttSell": "P",
                "ddBuy": "N",
                "ddSell": "N",
                "chequeBuy": "N",
                "chequeSell": "N",
            },
            "dfcc-rates-docs": {
                "buyLkr": "P",
                "sellLkr": "P",
                "asOf": "P",
                "spreadLkr": "P",
                "currency": "P",
                "ttBuy": "P",
                "ttSell": "P",
                "ddBuy": "N",
                "ddSell": "N",
                "chequeBuy": "N",
                "chequeSell": "N",
            },
            "boc-rates-docs": {
                "buyLkr": "P",
                "sellLkr": "P",
                "asOf": "P",
                "spreadLkr": "P",
                "currency": "P",
                "ttBuy": "P",
                "ttSell": "P",
                "ddBuy": "N",
                "ddSell": "N",
                "chequeBuy": "N",
                "chequeSell": "N",
            },
            "peoples-bank-rates-docs": {
                "buyLkr": "P",
                "sellLkr": "P",
                "asOf": "P",
                "spreadLkr": "P",
                "currency": "P",
                "ttBuy": "P",
                "ttSell": "P",
                "ddBuy": "N",
                "ddSell": "N",
                "chequeBuy": "N",
                "chequeSell": "N",
            },
            "ndb-rates-docs": {
                "buyLkr": "P",
                "sellLkr": "P",
                "asOf": "P",
                "spreadLkr": "P",
                "currency": "P",
                "ttBuy": "P",
                "ttSell": "P",
                "ddBuy": "N",
                "ddSell": "N",
                "chequeBuy": "N",
                "chequeSell": "N",
            },
            "cbsl-public-data-docs": {
                "buyLkr": "P",
                "sellLkr": "P",
                "asOf": "Y",
                "spreadLkr": "P",
                "currency": "Y",
                "ttBuy": "P",
                "ttSell": "P",
                "ddBuy": "N",
                "ddSell": "N",
                "chequeBuy": "N",
                "chequeSell": "N",
            },
            "sl-bank-remittance-tt-docs": {
                "buyLkr": "Y",
                "sellLkr": "Y",
                "asOf": "Y",
                "spreadLkr": "Y",
                "currency": "Y",
                "ttBuy": "Y",
                "ttSell": "Y",
                "ddBuy": "P",
                "ddSell": "P",
                "chequeBuy": "N",
                "chequeSell": "N",
            },
            "pabc-card-offers-docs": {
                "buyLkr": "K",
                "sellLkr": "K",
                "asOf": "K",
                "spreadLkr": "K",
                "currency": "K",
                "ttBuy": "K",
                "ttSell": "K",
                "ddBuy": "K",
                "ddSell": "K",
                "chequeBuy": "K",
                "chequeSell": "K",
            },
            "amana-union-cargills-bank-docs": {
                "buyLkr": "P",
                "sellLkr": "P",
                "asOf": "P",
                "spreadLkr": "P",
                "currency": "P",
                "ttBuy": "P",
                "ttSell": "P",
                "ddBuy": "N",
                "ddSell": "N",
                "chequeBuy": "N",
                "chequeSell": "N",
            },
            "sdb-rates-docs": {
                "buyLkr": "P",
                "sellLkr": "P",
                "asOf": "P",
                "spreadLkr": "P",
                "currency": "P",
                "ttBuy": "P",
                "ttSell": "P",
                "ddBuy": "N",
                "ddSell": "N",
                "chequeBuy": "N",
                "chequeSell": "N",
            },
        },
    },
    "fd_deposits": {
        "title": "Fixed deposits / interest rates",
        "canonical": [
            "tenorMonths",
            "paidIn",
            "ratePa",
            "aerPa",
            "effectiveFrom",
            "seniorCitizen",
            "productCode",
            "productName",
            "currency",
        ],
        "rows": {
            "combank-api-docs": {
                "tenorMonths": "Y",
                "paidIn": "Y",
                "ratePa": "Y",
                "aerPa": "N",
                "effectiveFrom": "N",
                "seniorCitizen": "N",
                "productCode": "P",
                "productName": "P",
                "currency": "P",
            },
            "sampath-api-docs": {
                "tenorMonths": "Y",
                "paidIn": "Y",
                "ratePa": "Y",
                "aerPa": "Y",
                "effectiveFrom": "Y",
                "seniorCitizen": "Y",
                "productCode": "Y",
                "productName": "Y",
                "currency": "P",
            },
            "seylan-api-docs": {
                "tenorMonths": "Y",
                "paidIn": "Y",
                "ratePa": "Y",
                "aerPa": "N",
                "effectiveFrom": "N",
                "seniorCitizen": "Y",
                "productCode": "Y",
                "productName": "P",
                "currency": "P",
            },
            "hnb-venus-api-docs": {
                "tenorMonths": "Y",
                "paidIn": "Y",
                "ratePa": "Y",
                "aerPa": "Y",
                "effectiveFrom": "Y",
                "seniorCitizen": "Y",
                "productCode": "P",
                "productName": "Y",
                "currency": "P",
            },
            "nsb-rates-docs": {
                "tenorMonths": "P",
                "paidIn": "P",
                "ratePa": "P",
                "aerPa": "N",
                "effectiveFrom": "P",
                "seniorCitizen": "P",
                "productCode": "N",
                "productName": "P",
                "currency": "P",
            },
            "dfcc-rates-docs": {
                "tenorMonths": "P",
                "paidIn": "P",
                "ratePa": "P",
                "aerPa": "N",
                "effectiveFrom": "P",
                "seniorCitizen": "P",
                "productCode": "N",
                "productName": "P",
                "currency": "P",
            },
            "boc-rates-docs": {
                "tenorMonths": "P",
                "paidIn": "P",
                "ratePa": "P",
                "aerPa": "N",
                "effectiveFrom": "P",
                "seniorCitizen": "P",
                "productCode": "K",
                "productName": "P",
                "currency": "P",
            },
            "peoples-bank-rates-docs": {
                "tenorMonths": "P",
                "paidIn": "P",
                "ratePa": "P",
                "aerPa": "N",
                "effectiveFrom": "P",
                "seniorCitizen": "P",
                "productCode": "N",
                "productName": "P",
                "currency": "P",
            },
            "ndb-rates-docs": {
                "tenorMonths": "P",
                "paidIn": "P",
                "ratePa": "P",
                "aerPa": "N",
                "effectiveFrom": "P",
                "seniorCitizen": "P",
                "productCode": "N",
                "productName": "P",
                "currency": "P",
            },
            "pabc-card-offers-docs": {
                "tenorMonths": "P",
                "paidIn": "P",
                "ratePa": "P",
                "aerPa": "N",
                "effectiveFrom": "P",
                "seniorCitizen": "Y",
                "productCode": "N",
                "productName": "P",
                "currency": "P",
            },
            "sl-bank-fd-rates-docs": {
                "tenorMonths": "Y",
                "paidIn": "Y",
                "ratePa": "Y",
                "aerPa": "Y",
                "effectiveFrom": "Y",
                "seniorCitizen": "Y",
                "productCode": "Y",
                "productName": "Y",
                "currency": "Y",
            },
            "cbsl-public-data-docs": {
                "tenorMonths": "N",
                "paidIn": "N",
                "ratePa": "P",
                "aerPa": "N",
                "effectiveFrom": "Y",
                "seniorCitizen": "N",
                "productCode": "N",
                "productName": "P",
                "currency": "P",
            },
            "sdb-rates-docs": {
                "tenorMonths": "P",
                "paidIn": "P",
                "ratePa": "P",
                "aerPa": "N",
                "effectiveFrom": "P",
                "seniorCitizen": "P",
                "productCode": "N",
                "productName": "P",
                "currency": "P",
            },
            "amana-union-cargills-bank-docs": {
                "tenorMonths": "P",
                "paidIn": "P",
                "ratePa": "P",
                "aerPa": "N",
                "effectiveFrom": "P",
                "seniorCitizen": "P",
                "productCode": "N",
                "productName": "P",
                "currency": "P",
            },
            "sc-hsbc-offers-park-docs": {
                "tenorMonths": "K",
                "paidIn": "K",
                "ratePa": "K",
                "aerPa": "K",
                "effectiveFrom": "K",
                "seniorCitizen": "K",
                "productCode": "K",
                "productName": "K",
                "currency": "K",
            },
        },
    },
    "card_offers": {
        "title": "Supermarket / card offers",
        "canonical": [
            "bank",
            "merchant",
            "title",
            "discountLabel",
            "weekdayHint",
            "validTo",
            "cardType",
            "sourceUrl",
            "asOf",
            "minSpend",
        ],
        "rows": {
            "sampath-api-docs": {
                "bank": "Y",
                "merchant": "Y",
                "title": "Y",
                "discountLabel": "Y",
                "weekdayHint": "P",
                "validTo": "Y",
                "cardType": "P",
                "sourceUrl": "Y",
                "asOf": "P",
                "minSpend": "P",
            },
            "hnb-venus-api-docs": {
                "bank": "Y",
                "merchant": "Y",
                "title": "Y",
                "discountLabel": "P",
                "weekdayHint": "P",
                "validTo": "P",
                "cardType": "Y",
                "sourceUrl": "Y",
                "asOf": "P",
                "minSpend": "P",
            },
            "combank-api-docs": {
                "bank": "Y",
                "merchant": "P",
                "title": "Y",
                "discountLabel": "P",
                "weekdayHint": "P",
                "validTo": "P",
                "cardType": "P",
                "sourceUrl": "Y",
                "asOf": "P",
                "minSpend": "N",
            },
            "visa-lk-perks-api-docs": {
                "bank": "P",
                "merchant": "Y",
                "title": "Y",
                "discountLabel": "Y",
                "weekdayHint": "P",
                "validTo": "Y",
                "cardType": "P",
                "sourceUrl": "Y",
                "asOf": "P",
                "minSpend": "P",
            },
            "dfcc-rates-docs": {
                "bank": "Y",
                "merchant": "P",
                "title": "P",
                "discountLabel": "P",
                "weekdayHint": "P",
                "validTo": "P",
                "cardType": "P",
                "sourceUrl": "Y",
                "asOf": "P",
                "minSpend": "N",
            },
            "peoples-bank-rates-docs": {
                "bank": "Y",
                "merchant": "P",
                "title": "P",
                "discountLabel": "P",
                "weekdayHint": "P",
                "validTo": "P",
                "cardType": "P",
                "sourceUrl": "Y",
                "asOf": "P",
                "minSpend": "N",
            },
            "ndb-rates-docs": {
                "bank": "Y",
                "merchant": "P",
                "title": "P",
                "discountLabel": "P",
                "weekdayHint": "P",
                "validTo": "P",
                "cardType": "P",
                "sourceUrl": "Y",
                "asOf": "P",
                "minSpend": "N",
            },
            "pabc-card-offers-docs": {
                "bank": "Y",
                "merchant": "Y",
                "title": "Y",
                "discountLabel": "Y",
                "weekdayHint": "P",
                "validTo": "P",
                "cardType": "P",
                "sourceUrl": "Y",
                "asOf": "P",
                "minSpend": "N",
            },
            "ntb-amex-offers-docs": {
                "bank": "Y",
                "merchant": "P",
                "title": "P",
                "discountLabel": "P",
                "weekdayHint": "P",
                "validTo": "P",
                "cardType": "P",
                "sourceUrl": "Y",
                "asOf": "P",
                "minSpend": "N",
            },
            "sl-bank-card-offers-docs": {
                "bank": "Y",
                "merchant": "Y",
                "title": "Y",
                "discountLabel": "Y",
                "weekdayHint": "Y",
                "validTo": "Y",
                "cardType": "Y",
                "sourceUrl": "Y",
                "asOf": "Y",
                "minSpend": "P",
            },
            "mypromo-park-docs": {
                "bank": "K",
                "merchant": "K",
                "title": "K",
                "discountLabel": "K",
                "weekdayHint": "K",
                "validTo": "K",
                "cardType": "K",
                "sourceUrl": "K",
                "asOf": "K",
                "minSpend": "K",
            },
            "sc-hsbc-offers-park-docs": {
                "bank": "K",
                "merchant": "K",
                "title": "K",
                "discountLabel": "K",
                "weekdayHint": "K",
                "validTo": "K",
                "cardType": "K",
                "sourceUrl": "K",
                "asOf": "K",
                "minSpend": "K",
            },
            "amana-union-cargills-bank-docs": {
                "bank": "Y",
                "merchant": "P",
                "title": "P",
                "discountLabel": "P",
                "weekdayHint": "P",
                "validTo": "P",
                "cardType": "P",
                "sourceUrl": "Y",
                "asOf": "P",
                "minSpend": "N",
            },
        },
    },
    "food_prices": {
        "title": "Food / staples prices",
        "canonical": [
            "commodity",
            "unit",
            "priceLkr",
            "marketOrDistrict",
            "asOf",
            "currency",
            "sourceLag",
            "basketId",
        ],
        "rows": {
            "foodlk-api-docs": {
                "commodity": "Y",
                "unit": "Y",
                "priceLkr": "Y",
                "marketOrDistrict": "P",
                "asOf": "Y",
                "currency": "Y",
                "sourceLag": "P",
                "basketId": "Y",
            },
            "wfp-hdx-lka-food-docs": {
                "commodity": "Y",
                "unit": "Y",
                "priceLkr": "Y",
                "marketOrDistrict": "Y",
                "asOf": "Y",
                "currency": "Y",
                "sourceLag": "Y",
                "basketId": "P",
            },
            "harti-cbsl-food-pdf-docs": {
                "commodity": "P",
                "unit": "P",
                "priceLkr": "P",
                "marketOrDistrict": "P",
                "asOf": "P",
                "currency": "P",
                "sourceLag": "P",
                "basketId": "N",
            },
            "ardeno-sister-backends-docs": {
                "commodity": "Y",
                "unit": "Y",
                "priceLkr": "Y",
                "marketOrDistrict": "P",
                "asOf": "Y",
                "currency": "Y",
                "sourceLag": "P",
                "basketId": "Y",
            },
        },
    },
    "markets_cse": {
        "title": "CSE / markets",
        "canonical": [
            "symbol",
            "name",
            "lastPrice",
            "change",
            "changePct",
            "volume",
            "sector",
            "asOf",
            "announcementTitle",
        ],
        "rows": {
            "cse-api-docs-deepen": {
                "symbol": "Y",
                "name": "Y",
                "lastPrice": "Y",
                "change": "Y",
                "changePct": "Y",
                "volume": "Y",
                "sector": "Y",
                "asOf": "Y",
                "announcementTitle": "Y",
            },
        },
    },
    "utilities": {
        "title": "Power / water / irrigation",
        "canonical": [
            "groupId",
            "clusterName",
            "scheduleWindow",
            "billTotalLkr",
            "consumption",
            "gaugeLevel",
            "alertStatus",
            "rainfallMm",
            "asOf",
        ],
        "rows": {
            "cebcare-api-docs": {
                "groupId": "Y",
                "clusterName": "Y",
                "scheduleWindow": "Y",
                "billTotalLkr": "N",
                "consumption": "N",
                "gaugeLevel": "N",
                "alertStatus": "P",
                "rainfallMm": "N",
                "asOf": "P",
            },
            "nwsdb-bill-api-docs": {
                "groupId": "N",
                "clusterName": "N",
                "scheduleWindow": "N",
                "billTotalLkr": "Y",
                "consumption": "Y",
                "gaugeLevel": "N",
                "alertStatus": "N",
                "rainfallMm": "N",
                "asOf": "P",
            },
            "irrigation-arcgis-api-docs": {
                "groupId": "N",
                "clusterName": "N",
                "scheduleWindow": "N",
                "billTotalLkr": "N",
                "consumption": "N",
                "gaugeLevel": "Y",
                "alertStatus": "Y",
                "rainfallMm": "Y",
                "asOf": "Y",
            },
            "leco-outages-docs": {
                "groupId": "N",
                "clusterName": "P",
                "scheduleWindow": "P",
                "billTotalLkr": "N",
                "consumption": "N",
                "gaugeLevel": "N",
                "alertStatus": "P",
                "rainfallMm": "N",
                "asOf": "P",
            },
            "lk-flood-api-docs": {
                "groupId": "N",
                "clusterName": "N",
                "scheduleWindow": "N",
                "billTotalLkr": "N",
                "consumption": "N",
                "gaugeLevel": "Y",
                "alertStatus": "Y",
                "rainfallMm": "N",
                "asOf": "Y",
            },
        },
    },
    "weather_aqi": {
        "title": "Weather / air quality / warnings",
        "canonical": [
            "tempC",
            "precipMm",
            "uvIndex",
            "pm25",
            "usAqi",
            "warningLevel",
            "capLanguage",
            "asOf",
            "latLon",
        ],
        "rows": {
            "open-meteo-lk-docs": {
                "tempC": "Y",
                "precipMm": "Y",
                "uvIndex": "Y",
                "pm25": "Y",
                "usAqi": "Y",
                "warningLevel": "N",
                "capLanguage": "N",
                "asOf": "Y",
                "latLon": "Y",
            },
            "openaq-lk-docs": {
                "tempC": "N",
                "precipMm": "N",
                "uvIndex": "N",
                "pm25": "Y",
                "usAqi": "P",
                "warningLevel": "N",
                "capLanguage": "N",
                "asOf": "Y",
                "latLon": "Y",
            },
            "metdept-cap-api-docs": {
                "tempC": "N",
                "precipMm": "N",
                "uvIndex": "N",
                "pm25": "N",
                "usAqi": "N",
                "warningLevel": "Y",
                "capLanguage": "Y",
                "asOf": "Y",
                "latLon": "P",
            },
            "gdacs-firms-docs": {
                "tempC": "N",
                "precipMm": "N",
                "uvIndex": "N",
                "pm25": "N",
                "usAqi": "N",
                "warningLevel": "Y",
                "capLanguage": "N",
                "asOf": "Y",
                "latLon": "Y",
            },
        },
    },
    "fuel_energy": {
        "title": "Fuel / LPG / EMI retail",
        "canonical": [
            "product",
            "priceLkr",
            "unit",
            "asOf",
            "worldCompare",
            "emiBank",
            "emiTenorMonths",
            "emiMonthlyLkr",
        ],
        "rows": {
            "octane-fuel-api-docs": {
                "product": "Y",
                "priceLkr": "Y",
                "unit": "Y",
                "asOf": "Y",
                "worldCompare": "Y",
                "emiBank": "N",
                "emiTenorMonths": "N",
                "emiMonthlyLkr": "N",
            },
            "litro-laugfs-lpg-docs": {
                "product": "P",
                "priceLkr": "P",
                "unit": "P",
                "asOf": "P",
                "worldCompare": "N",
                "emiBank": "N",
                "emiTenorMonths": "N",
                "emiMonthlyLkr": "N",
            },
            "singer-emi-api-docs": {
                "product": "Y",
                "priceLkr": "Y",
                "unit": "P",
                "asOf": "P",
                "worldCompare": "N",
                "emiBank": "Y",
                "emiTenorMonths": "Y",
                "emiMonthlyLkr": "Y",
            },
            "softlogic-emi-park-docs": {
                "product": "K",
                "priceLkr": "K",
                "unit": "K",
                "asOf": "K",
                "worldCompare": "K",
                "emiBank": "K",
                "emiTenorMonths": "K",
                "emiMonthlyLkr": "K",
            },
            "ardeno-sister-backends-docs": {
                "product": "Y",
                "priceLkr": "Y",
                "unit": "Y",
                "asOf": "Y",
                "worldCompare": "Y",
                "emiBank": "N",
                "emiTenorMonths": "N",
                "emiMonthlyLkr": "N",
            },
        },
    },
    "macro_cbsl": {
        "title": "CBSL macro / policy / gold",
        "canonical": [
            "opr",
            "sdfr",
            "slfr",
            "awpr",
            "tbillYield",
            "goldPrice",
            "asOf",
            "bulletinUrl",
        ],
        "rows": {
            "cbsl-public-data-docs": {
                "opr": "Y",
                "sdfr": "Y",
                "slfr": "Y",
                "awpr": "Y",
                "tbillYield": "Y",
                "goldPrice": "P",
                "asOf": "Y",
                "bulletinUrl": "Y",
            },
            "gold-retail-rates-docs": {
                "opr": "N",
                "sdfr": "N",
                "slfr": "N",
                "awpr": "N",
                "tbillYield": "N",
                "goldPrice": "P",
                "asOf": "P",
                "bulletinUrl": "N",
            },
        },
    },
    "platform_misc": {
        "title": "Platform / tenders / packs",
        "canonical": [
            "tenderTitle",
            "closingDate",
            "district",
            "category",
            "healthOk",
            "openapiPath",
        ],
        "rows": {
            "promise-lk-tenders-docs": {
                "tenderTitle": "P",
                "closingDate": "P",
                "district": "P",
                "category": "P",
                "healthOk": "N",
                "openapiPath": "N",
            },
            "ardeno-sister-backends-docs": {
                "tenderTitle": "N",
                "closingDate": "N",
                "district": "N",
                "category": "N",
                "healthOk": "Y",
                "openapiPath": "Y",
            },
            "foodlk-api-docs": {
                "tenderTitle": "N",
                "closingDate": "N",
                "district": "N",
                "category": "N",
                "healthOk": "Y",
                "openapiPath": "Y",
            },
        },
    },
}

LEGEND = {
    "Y": "Full machine-readable field (JSON or stable parse)",
    "P": "Partial — HTML scrape, derived, or incomplete",
    "N": "Not available on this surface",
    "K": "Parked / out of scope for this package",
}


def score_row(cells: dict[str, str]) -> dict[str, int]:
    return {
        "Y": sum(1 for v in cells.values() if v == "Y"),
        "P": sum(1 for v in cells.values() if v == "P"),
        "N": sum(1 for v in cells.values() if v == "N"),
        "K": sum(1 for v in cells.values() if v == "K"),
    }


def build_doc() -> dict:
    packages_seen: set[str] = set()
    domains_out = {}
    for domain_id, domain in DOMAINS.items():
        rows_out = {}
        for slug, cells in domain["rows"].items():
            packages_seen.add(slug)
            # fill missing canonical with N
            full = {f: cells.get(f, "N") for f in domain["canonical"]}
            rows_out[slug] = {"coverage": full, "counts": score_row(full)}
        domains_out[domain_id] = {
            "title": domain["title"],
            "canonical_fields": domain["canonical"],
            "packages": rows_out,
        }

    # Ensure every package in INDEX appears somewhere (or in orphans)
    index_path = ROOT / "INDEX.yaml"
    all_slugs = []
    if index_path.exists():
        idx = yaml.safe_load(index_path.read_text())
        all_slugs = [p["slug"] for p in idx.get("packages", [])]
    orphans = sorted(set(all_slugs) - packages_seen)

    return {
        "version": 1,
        "title": "Field coverage matrix — all Tier A/B api-docs packages",
        "legend": LEGEND,
        "notes": [
            "Canonical fields follow Lankawa snapshot types (RemittanceBankQuote, BankDepositRateQuote, CardOffer, etc.).",
            "Aggregator packs (sl-bank-*) inherit best-of sibling coverage.",
            "Y/P/N/K is research-time judgment from deep-dives — re-probe after extraction.",
            "See docs/BANK_FD_API_SCHEMAS.md for FD field maps; this matrix covers all domains.",
        ],
        "domains": domains_out,
        "package_count_indexed": len(all_slugs),
        "package_count_in_matrix": len(packages_seen),
        "packages_without_domain_row": orphans,
    }


def render_md(doc: dict) -> str:
    lines = [
        f"# {doc['title']}",
        "",
        "Machine source: [`FIELD_COVERAGE_MATRIX.yaml`](./FIELD_COVERAGE_MATRIX.yaml) · regenerate with `python3 scripts/build-field-coverage-matrix.py`.",
        "",
        "## Legend",
        "",
        "| Code | Meaning |",
        "|------|---------|",
    ]
    for k, v in doc["legend"].items():
        lines.append(f"| `{k}` | {v} |")
    lines += ["", "## Notes", ""]
    for n in doc["notes"]:
        lines.append(f"- {n}")
    lines.append("")

    for domain_id, domain in doc["domains"].items():
        lines += [f"## {domain['title']}", "", f"_Domain id:_ `{domain_id}`", ""]
        fields = domain["canonical_fields"]
        header = "| Package | " + " | ".join(f"`{f}`" for f in fields) + " | Y | P |"
        sep = "|---| " + " | ".join("---" for _ in fields) + " | --- | --- |"
        lines += [header, sep]
        for slug, row in sorted(domain["packages"].items()):
            cells = row["coverage"]
            counts = row["counts"]
            cell_s = " | ".join(cells[f] for f in fields)
            lines.append(f"| `{slug}` | {cell_s} | {counts['Y']} | {counts['P']} |")
        lines.append("")

    orphans = doc.get("packages_without_domain_row") or []
    if orphans:
        lines += [
            "## Packages without a domain row",
            "",
            "These exist in `INDEX.yaml` but have no matrix cells yet:",
            "",
        ]
        for s in orphans:
            lines.append(f"- `{s}`")
        lines.append("")

    # Package rollup
    lines += ["## Package rollup (all domains)", "", "| Package | Domains | ΣY | ΣP | ΣN | ΣK |", "|---|---|---|---|---|---|"]
    rollup: dict[str, dict[str, int]] = {}
    domain_hits: dict[str, list[str]] = {}
    for domain_id, domain in doc["domains"].items():
        for slug, row in domain["packages"].items():
            rollup.setdefault(slug, {"Y": 0, "P": 0, "N": 0, "K": 0})
            domain_hits.setdefault(slug, [])
            domain_hits[slug].append(domain_id)
            for k, v in row["counts"].items():
                rollup[slug][k] += v
    for slug in sorted(rollup):
        c = rollup[slug]
        lines.append(
            f"| `{slug}` | {', '.join(domain_hits[slug])} | {c['Y']} | {c['P']} | {c['N']} | {c['K']} |"
        )
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    doc = build_doc()
    OUT_YAML.write_text(yaml.dump(doc, sort_keys=False, allow_unicode=True))
    OUT_MD.write_text(render_md(doc))
    OUT_JSON.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n")
    print(
        "wrote",
        OUT_YAML,
        OUT_MD,
        OUT_JSON,
        "domains=",
        len(doc["domains"]),
        "orphans=",
        doc["packages_without_domain_row"],
    )


if __name__ == "__main__":
    main()
