#!/usr/bin/env python3
"""Classify every catalog endpoint as JSON API vs HTML scrape (etc.) for all packages.

Writes:
  - api-docs/packages/<slug>/docs/HTML_VS_API.md
  - stamps access: on each endpoint in catalog/endpoints.yaml (idempotent)
  - api-docs/HTML_VS_API.md + .yaml
  - src/lib/api-docs-html-vs-api.json
"""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

import yaml

ROOT = Path("api-docs/packages")
INDEX_MD = Path("api-docs/HTML_VS_API.md")
INDEX_YAML = Path("api-docs/HTML_VS_API.yaml")
JSON_OUT = Path("src/lib/api-docs-html-vs-api.json")

ACCESS_ORDER = (
    "json_api",
    "arcgis_api",
    "xml_cap",
    "csv_download",
    "pdf_document",
    "html_scrape",
    "hybrid",
    "parked",
    "unknown",
)

ACCESS_LABELS = {
    "json_api": "JSON / machine API",
    "arcgis_api": "ArcGIS FeatureServer / query API",
    "xml_cap": "XML / CAP feed",
    "csv_download": "CSV download",
    "pdf_document": "PDF / document index",
    "html_scrape": "HTML scrape",
    "hybrid": "Hybrid (API bootstrap + HTML)",
    "parked": "Parked (do not scrape / stale)",
    "unknown": "Unknown / classify manually",
}


def _blob(ep: dict) -> str:
    parts = [
        str(ep.get("id") or ""),
        str(ep.get("path") or ""),
        str(ep.get("url") or ""),
        str(ep.get("summary") or ""),
        str(ep.get("method") or ""),
    ]
    pag = ep.get("pagination") or {}
    if isinstance(pag, dict):
        parts.append(str(pag.get("style") or ""))
        parts.append(str(pag.get("notes") or ""))
    return " ".join(parts).lower()


def classify_endpoint(ep: dict) -> str:
    """Return access class for one endpoint."""
    override = ep.get("access_override") or ep.get("access_manual")
    if override in ACCESS_ORDER:
        return str(override)

    status = str(ep.get("status") or "").lower()
    if status == "parked" or "park" in str(ep.get("id") or "").lower():
        return "parked"

    text = _blob(ep)
    url = str(ep.get("url") or "").lower()
    path = str(ep.get("path") or "").lower()
    summary = str(ep.get("summary") or "").lower()
    pag = ep.get("pagination") or {}
    style = str(pag.get("style") or "").lower() if isinstance(pag, dict) else ""

    if "park" in summary or "do not scrape" in summary or "tos bans" in summary:
        return "parked"

    if "featureserver" in url or "arcgis" in url or ("/query" in path and "arcgis" in text):
        return "arcgis_api"
    if ".rss" in url or "rss.xml" in url or ("rss" in summary and "xml" in text):
        return "xml_cap"
    if "cap" in text and ("xml" in text or ".xml" in url or "atom" in text):
        return "xml_cap"
    if ".csv" in url or (
        "csv" in summary and ("download" in summary or "hdx" in text or "firms" in text)
    ):
        return "csv_download"
    if ".pdf" in url or "pdf" in summary:
        return "pdf_document"

    jsonish = (
        "/api/" in url
        or "/api/" in path
        or "/api_" in path
        or "/api_" in url
        or "/v3/" in path
        or "/v3/" in url
        or "/v2/" in path
        or "/v1/" in path
        or path.endswith(".json")
        or ".json" in url
        or "application/json" in text
        or re.search(r"\bjson\b", summary) is not None
        or "json-get" in path
        or "json-get" in url
        or "openapi" in text
        or "graphql" in text
        or "eresearch" in path
        or "eresearch" in url
        or path.endswith("/health")
        or "/health" in path
        or "getdemandmgmt" in path.lower()
        or "billcalculator" in path.lower()
        or "gettariffadjustment" in path.lower()
    )
    htmlish = (
        style in {"html-list", "html", "scrape"}
        or "html" in summary
        or "scrape" in summary
        or ("tariff" in summary and "html" in text)
        or (
            re.search(r"\b(page|table|hub)\b", summary) is not None
            and "/api/" not in url
            and "/api_" not in url
        )
    )

    # Bootstrap hybrid: CEB antiforgery HTML then JSON POST
    if "antiforgery" in text or ("bootstrap" in summary and "html" in summary):
        return "hybrid"
    if jsonish and htmlish:
        return "hybrid"
    if jsonish:
        return "json_api"
    if htmlish:
        return "html_scrape"

    # Path heuristics when summary is thin
    if any(
        x in path or x in url
        for x in (
            "/api/",
            "/api_",
            "/rest/",
            "/v1/",
            "/v2/",
            "/v3/",
            "featureserver",
            "json-get",
            "eresearch",
        )
    ):
        if "featureserver" in url or "arcgis" in url:
            return "arcgis_api"
        return "json_api"

    # Public webpage-looking paths
    if path in {"/", ""} or path.endswith(".php") or path.endswith(".aspx"):
        return "html_scrape"
    if not any(x in path for x in ("/api", ".json", ".csv", ".xml", "query")):
        # Bank rates pages etc.
        if any(
            x in path
            for x in (
                "rate",
                "offer",
                "promo",
                "reward",
                "deposit",
                "exchange",
                "card",
                "price",
                "notice",
                "outage",
                "interrupt",
            )
        ):
            return "html_scrape"

    return "unknown"


def prefer_note(access: str, ep: dict) -> str:
    summary = str(ep.get("summary") or "").strip()
    if access == "parked":
        return summary or "Parked — do not treat as a live scrape target."
    if access == "html_scrape" and "prefer" in summary.lower() and "json" in summary.lower():
        return summary
    if access == "json_api" and "stale" in summary.lower():
        return summary
    return summary


def load_yaml(path: Path) -> dict:
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def dump_yaml(path: Path, data: dict) -> None:
    path.write_text(
        yaml.safe_dump(data, sort_keys=False, allow_unicode=True),
        encoding="utf-8",
    )


def render_pkg_md(slug: str, data: dict, rows: list[dict]) -> str:
    title = data.get("title") or slug
    tier = data.get("tier") or "?"
    counts = Counter(r["access"] for r in rows)
    lines = [
        f"# HTML scrape vs API — `{slug}`",
        "",
        f"**{title}** · Tier {tier}",
        "",
        "Unofficial classification of each catalog endpoint: machine JSON/API "
        "surfaces versus HTML scrape (or PDF/CSV/XML/park).",
        "",
        "Regenerate: `python3 scripts/build-html-vs-api.py`",
        "",
        "## Summary",
        "",
        "| Access | Count |",
        "|---|---:|",
    ]
    for key in ACCESS_ORDER:
        if counts.get(key):
            lines.append(f"| {ACCESS_LABELS[key]} (`{key}`) | {counts[key]} |")
    lines += [
        "",
        "## Endpoints",
        "",
        "| Id | Access | Method | Path / URL | Notes |",
        "|---|---|---|---|---|",
    ]
    for r in rows:
        notes = (r.get("notes") or "").replace("|", "\\|")
        path = r.get("path") or r.get("url") or ""
        lines.append(
            f"| `{r['id']}` | `{r['access']}` | {r.get('method') or '—'} | "
            f"`{path}` | {notes} |"
        )
    lines += [
        "",
        "## Guidance",
        "",
        "- Prefer **`json_api` / `arcgis_api` / `csv_download` / `xml_cap`** when live and accurate.",
        "- Use **`html_scrape`** only with polite delays and when no trustworthy machine surface exists "
        "(see BOC: prefer rates-tariff HTML over parked stale JSON).",
        "- **`parked`** means do not automate — document why in ETHICS / PARK notes.",
        "- **`hybrid`** needs an HTML bootstrap (token/cookie) before a JSON call.",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    packages_out: list[dict] = []
    all_counts: Counter[str] = Counter()

    for pkg_dir in sorted(p for p in ROOT.iterdir() if p.is_dir()):
        ep_path = pkg_dir / "catalog" / "endpoints.yaml"
        if not ep_path.exists():
            continue
        data = load_yaml(ep_path)
        endpoints = data.get("endpoints") or []
        rows: list[dict] = []
        changed = False
        for ep in endpoints:
            access = classify_endpoint(ep)
            if ep.get("access") != access:
                ep["access"] = access
                changed = True
            row = {
                "id": ep.get("id") or "",
                "access": access,
                "method": ep.get("method") or "GET",
                "path": ep.get("path") or "",
                "url": ep.get("url") or "",
                "status": ep.get("status") or "live",
                "notes": prefer_note(access, ep),
            }
            rows.append(row)
            all_counts[access] += 1

        if changed:
            data["endpoints"] = endpoints
            dump_yaml(ep_path, data)

        docs = pkg_dir / "docs"
        docs.mkdir(parents=True, exist_ok=True)
        (docs / "HTML_VS_API.md").write_text(
            render_pkg_md(pkg_dir.name, data, rows), encoding="utf-8"
        )

        pkg_counts = Counter(r["access"] for r in rows)
        packages_out.append(
            {
                "slug": pkg_dir.name,
                "title": data.get("title") or pkg_dir.name,
                "tier": data.get("tier"),
                "category": data.get("category"),
                "counts": {k: pkg_counts.get(k, 0) for k in ACCESS_ORDER if pkg_counts.get(k)},
                "endpoints": rows,
                "api_like": sum(
                    pkg_counts.get(k, 0)
                    for k in ("json_api", "arcgis_api", "xml_cap", "csv_download")
                ),
                "html_like": pkg_counts.get("html_scrape", 0) + pkg_counts.get("hybrid", 0),
                "parked": pkg_counts.get("parked", 0),
            }
        )

    # Index markdown
    md = [
        "# HTML scrape vs API — catalog index",
        "",
        "Endpoint access classification for every Tier A/B staging package.",
        "",
        "Regenerate: `python3 scripts/build-html-vs-api.py`",
        "",
        "Per-package detail: `packages/<slug>/docs/HTML_VS_API.md` "
        "(also stamps `access:` on each endpoint in `catalog/endpoints.yaml`).",
        "",
        "## Catalog totals",
        "",
        "| Access | Count |",
        "|---|---:|",
    ]
    for key in ACCESS_ORDER:
        if all_counts.get(key):
            md.append(f"| {ACCESS_LABELS[key]} (`{key}`) | {all_counts[key]} |")
    md += [
        "",
        "## Packages",
        "",
        "| Package | Tier | API-like | HTML/hybrid | Parked | Dominant |",
        "|---|---|---:|---:|---:|---|",
    ]
    for pkg in packages_out:
        counts = pkg["counts"]
        dominant = max(counts, key=counts.get) if counts else "unknown"
        md.append(
            f"| [`{pkg['slug']}`](./packages/{pkg['slug']}/docs/HTML_VS_API.md) | "
            f"{pkg.get('tier') or '?'} | {pkg['api_like']} | {pkg['html_like']} | "
            f"{pkg['parked']} | `{dominant}` |"
        )
    md += [
        "",
        "## Legend",
        "",
    ]
    for key in ACCESS_ORDER:
        md.append(f"- **`{key}`** — {ACCESS_LABELS[key]}")
    md.append("")
    INDEX_MD.write_text("\n".join(md), encoding="utf-8")

    payload = {
        "version": 1,
        "access_labels": ACCESS_LABELS,
        "totals": {k: all_counts.get(k, 0) for k in ACCESS_ORDER if all_counts.get(k)},
        "packages": packages_out,
    }
    INDEX_YAML.write_text(
        yaml.safe_dump(payload, sort_keys=False, allow_unicode=True),
        encoding="utf-8",
    )
    JSON_OUT.parent.mkdir(parents=True, exist_ok=True)
    JSON_OUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    print(
        f"packages={len(packages_out)} endpoints={sum(all_counts.values())} "
        f"totals={dict(all_counts)}"
    )


if __name__ == "__main__":
    main()
