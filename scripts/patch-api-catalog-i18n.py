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
