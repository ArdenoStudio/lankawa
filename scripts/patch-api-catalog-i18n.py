#!/usr/bin/env python3
"""Patch developers.* catalog/lab i18n keys into en/si/ta."""
from __future__ import annotations

import json
from pathlib import Path

NEW = {
    "catalogTitle": "Unofficial API docs catalog",
    "catalogSubtitle": (
        "Tier A and B staging packages for Sri Lanka public data surfaces — "
        "banks, utilities, food, markets, and parks — ready to extract into "
        "separate Cookie-Cat21 docs repos."
    ),
    "catalogBanner": (
        "Unofficial community documentation. Not affiliated with upstream "
        "operators. Staging lives in this monorepo under api-docs/packages/."
    ),
    "catalogLabLink": "Open pagination lab",
    "catalogRepoLink": "Browse api-docs on GitHub",
    "catalogStatsTitle": "Catalog size",
    "catalogStatsBody": (
        "{count} packages · {tierA} Tier A · {tierB} Tier B · "
        "{lab} with pagination lab endpoints"
    ),
    "catalogSearch": "Search packages or endpoints",
    "catalogTierAll": "All tiers",
    "catalogCategoryAll": "All categories",
    "catalogTier": "Tier",
    "catalogCategory": "Category",
    "catalogEndpoints": "Endpoints",
    "catalogHasLab": "Pagination lab",
    "catalogExtractTo": "Extract to",
    "catalogEmpty": "No packages match these filters.",
    "catalogOpenLab": "Open in pagination lab",
    "catalogBack": "Back to API docs catalog",
    "catalogNavTitle": "Unofficial API catalog",
    "catalogNavBody": (
        "Explore staged Cookie-Cat21-style API docs packages (Tier A + B) "
        "and try pagination recipes before each package is split into its "
        "own public repo."
    ),
    "catalogNavLink": "Open category explorer",
    "labTitle": "Pagination lab",
    "labSubtitle": (
        "Tune page, limit, offset, and CEB group parameters for endpoints "
        "marked pagination.lab in the staging catalogs."
    ),
    "labBanner": (
        "Preview URLs only — probes run server-side in each package's "
        "scripts/probe.py after extraction. Respect upstream rate limits."
    ),
    "labPackage": "Package",
    "labAllPackages": "All lab packages",
    "labStyle": "Pagination style",
    "labParams": "Params",
    "labNotes": "Notes",
    "labPreview": "Preview URL",
    "labPage": "Page",
    "labLimit": "Limit / size",
    "labOffset": "Offset",
    "labGroup": "CEB group",
    "labEmpty": "No pagination-lab endpoints match.",
    "labBody": "Example request body",
    "coverageTitle": "Field coverage matrix",
    "coverageSubtitle": (
        "Canonical Lankawa snapshot fields mapped across every Tier A/B "
        "api-docs package — FX, FD, cards, food, CSE, utilities, weather, fuel, macro."
    ),
    "coverageBanner": (
        "Y = full machine field · P = partial/scrape · N = absent · K = parked. "
        "Source: api-docs/FIELD_COVERAGE_MATRIX.yaml."
    ),
    "coverageNavLink": "Open field coverage matrix",
    "coverageStats": "{domains} domains · {packages} packages covered",
    "coverageDomain": "Domain",
    "coverageAllDomains": "All domains",
    "coverageSearch": "Filter packages",
    "coverageLegend": "Legend",
    "coverageEmpty": "No packages match.",
    "coverageY": "Y",
    "coverageP": "P",
    "tsClientsTitle": "TypeScript + JavaScript clients",
    "tsClientsSubtitle": (
        "Unofficial thin clients for every Tier A/B staging package — "
        "typed TypeScript under typescript/, zero-build ESM under javascript/."
    ),
    "tsClientsBanner": (
        "Not affiliated with upstream operators. Default 1s delay. "
        "Parked endpoints throw. See api-docs/TYPESCRIPT_CLIENTS.md."
    ),
    "tsClientsNavLink": "Open TS/JS clients index",
    "tsClientsStats": "{count} packages with clients",
    "tsClientsColPackage": "Package",
    "tsClientsColNpm": "npm name",
    "tsClientsColClass": "Class",
    "tsClientsColMethods": "Methods",
    "tsClientsExample": (
        "import { CombankApiDocsClient } from '@cookie-cat21/combank-api-docs-client';\n"
        "const client = new CombankApiDocsClient({ defaultDelayMs: 1000 });\n"
        "const fx = await client.exchangeRates();"
    ),
    "pyClientsTitle": "Python clients",
    "pyClientsSubtitle": (
        "Polished installable unofficial helpers for every Tier A/B staging package — "
        "cse-api-docs style (setuptools, context manager, smoke.py, stdlib urllib)."
    ),
    "pyClientsBanner": (
        "Not affiliated with upstream operators. Default 1s delay. "
        "Parked endpoints raise RuntimeError. See api-docs/PYTHON_CLIENTS.md."
    ),
    "pyClientsNavLink": "Open Python clients index",
    "pyClientsStats": "{count} packages with Python clients",
    "pyClientsColPackage": "Package",
    "pyClientsColPip": "pip name",
    "pyClientsColModule": "Module",
    "pyClientsColClass": "Class",
    "pyClientsColMethods": "Methods",
    "pyClientsExample": (
        "from combank_api_docs import CombankApiDocsClient\n"
        "with CombankApiDocsClient(default_delay_seconds=1.0) as client:\n"
        "    fx = client.exchange_rates()\n"
        "    print(fx)"
    ),
    "clientExtrasTitle": "Client extras",
    "clientExtrasSubtitle": (
        "Typed models, pagination iterators, and shard helpers — shipped for "
        "every package in Python, TypeScript, and JavaScript."
    ),
    "clientExtrasBanner": (
        "See api-docs/CLIENT_EXTRAS.md and each package docs/CLIENT_EXTRAS.md. "
        "Regenerate with scripts/scaffold-client-extras.py."
    ),
    "clientExtrasNavLink": "Open client extras",
    "clientExtrasStats": "{count} packages · {labs} with pagination lab endpoints",
    "clientExtrasColPackage": "Package",
    "clientExtrasColModels": "Typed models",
    "clientExtrasColLabs": "Lab endpoints",
    "clientExtrasExample": (
        "from hnb_venus_api_docs import HnbVenusApiDocsClient, iter_lab_endpoint, shard_groups\n"
        "print(shard_groups(0, 4))\n"
        "with HnbVenusApiDocsClient() as client:\n"
        "    for page in iter_lab_endpoint(client, 'get_all_web_card_promos', max_pages=2):\n"
        "        print(page.page, len(page.items))"
    ),
}


def main() -> None:
    for loc in ("en", "si", "ta"):
        path = Path(f"messages/{loc}.json")
        data = json.loads(path.read_text(encoding="utf-8"))
        data["developers"].update(NEW)
        path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(loc, "developers", len(data["developers"]))


if __name__ == "__main__":
    main()
