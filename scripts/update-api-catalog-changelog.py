#!/usr/bin/env python3
"""Changelog automation for api-docs catalog/endpoints.yaml changes.

For every package:
  - Fingerprint endpoints → catalog/.endpoints.fingerprint.json
  - Diff vs previous fingerprint → append CHANGELOG.md
  - Install .github/workflows/catalog-changelog.yml (post-extract automation)

Also writes:
  - api-docs/CHANGELOG.md (rollup of package entries this run)
  - src/lib/api-docs-changelog.json (app mirror)

Usage:
  python3 scripts/update-api-catalog-changelog.py           # update if changed
  python3 scripts/update-api-catalog-changelog.py --force-bootstrap  # rewrite initial
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from datetime import date
from pathlib import Path

import yaml

ROOT = Path("api-docs/packages")
ROLLUP_MD = Path("api-docs/CHANGELOG.md")
JSON_OUT = Path("src/lib/api-docs-changelog.json")
TODAY = date.today().isoformat()

WORKFLOW = """name: catalog-changelog
on:
  push:
    paths:
      - "catalog/endpoints.yaml"
      - "PACKAGE.yaml"
  workflow_dispatch:
jobs:
  changelog:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Install PyYAML
        run: pip install pyyaml
      - name: Update changelog from catalog diff
        run: |
          python3 - <<'PY'
          import hashlib, json, re
          from datetime import date
          from pathlib import Path
          import yaml

          TODAY = date.today().isoformat()
          ep_path = Path("catalog/endpoints.yaml")
          fp_path = Path("catalog/.endpoints.fingerprint.json")
          cl_path = Path("CHANGELOG.md")

          def fingerprint(data):
              rows = []
              for ep in data.get("endpoints") or []:
                  rows.append({
                      "id": ep.get("id"),
                      "method": ep.get("method"),
                      "path": ep.get("path"),
                      "url": ep.get("url"),
                      "status": ep.get("status") or "live",
                      "access": ep.get("access"),
                      "summary": ep.get("summary"),
                      "pagination": ep.get("pagination"),
                  })
              rows.sort(key=lambda r: str(r.get("id") or ""))
              raw = json.dumps(rows, sort_keys=True, default=str)
              return {
                  "sha256": hashlib.sha256(raw.encode()).hexdigest(),
                  "endpoint_count": len(rows),
                  "endpoints": {r["id"]: r for r in rows if r.get("id")},
              }

          def diff(old, new):
              old_ids = set((old.get("endpoints") or {}).keys())
              new_ids = set((new.get("endpoints") or {}).keys())
              added = sorted(new_ids - old_ids)
              removed = sorted(old_ids - new_ids)
              changed = []
              for i in sorted(old_ids & new_ids):
                  if old["endpoints"][i] != new["endpoints"][i]:
                      changed.append(i)
              return added, removed, changed

          data = yaml.safe_load(ep_path.read_text()) or {}
          new_fp = fingerprint(data)
          old_fp = {}
          if fp_path.exists():
              old_fp = json.loads(fp_path.read_text())
          if old_fp.get("sha256") == new_fp["sha256"]:
              print("No catalog changes")
          else:
              added, removed, changed = diff(old_fp, new_fp)
              bullets = []
              for i in added:
                  ep = new_fp["endpoints"][i]
                  bullets.append(f"- **Added** `{i}` ({ep.get('method')} `{ep.get('path')}`)")
              for i in removed:
                  bullets.append(f"- **Removed** `{i}`")
              for i in changed:
                  bullets.append(f"- **Changed** `{i}`")
              if not bullets:
                  bullets.append("- Catalog fingerprint updated (metadata / ordering).")
              entry = f"## {TODAY}\\n\\n" + "\\n".join(bullets) + "\\n"
              existing = cl_path.read_text() if cl_path.exists() else "# Changelog\\n\\n"
              if not existing.lstrip().startswith("#"):
                  existing = "# Changelog\\n\\n" + existing
              # Insert after first heading
              parts = existing.split("\\n", 1)
              if len(parts) == 2 and parts[0].startswith("#"):
                  body = parts[0] + "\\n\\n" + entry + "\\n" + parts[1].lstrip("\\n")
              else:
                  body = "# Changelog\\n\\n" + entry + "\\n" + existing
              cl_path.write_text(body)
              fp_path.write_text(json.dumps(new_fp, indent=2) + "\\n")
              print("CHANGELOG updated", len(added), len(removed), len(changed))
          PY
      - name: Commit changelog if dirty
        run: |
          git config user.name "catalog-changelog[bot]"
          git config user.email "catalog-changelog[bot]@users.noreply.github.com"
          git add CHANGELOG.md catalog/.endpoints.fingerprint.json || true
          if git diff --cached --quiet; then
            echo "Nothing to commit"
          else
            git commit -m "docs(changelog): catalog endpoints update"
            git push
          fi
"""


def endpoint_fingerprint(data: dict) -> dict:
    rows = []
    for ep in data.get("endpoints") or []:
        rows.append(
            {
                "id": ep.get("id"),
                "method": ep.get("method"),
                "path": ep.get("path"),
                "url": ep.get("url"),
                "status": ep.get("status") or "live",
                "access": ep.get("access"),
                "summary": ep.get("summary"),
                "pagination": ep.get("pagination"),
            }
        )
    rows.sort(key=lambda r: str(r.get("id") or ""))
    raw = json.dumps(rows, sort_keys=True, default=str)
    return {
        "sha256": hashlib.sha256(raw.encode()).hexdigest(),
        "endpoint_count": len(rows),
        "endpoints": {r["id"]: r for r in rows if r.get("id")},
        "updated": TODAY,
    }


def diff_fps(old: dict, new: dict) -> tuple[list[str], list[str], list[str]]:
    old_ids = set((old.get("endpoints") or {}).keys())
    new_ids = set((new.get("endpoints") or {}).keys())
    added = sorted(new_ids - old_ids)
    removed = sorted(old_ids - new_ids)
    changed = []
    for i in sorted(old_ids & new_ids):
        if old["endpoints"][i] != new["endpoints"][i]:
            changed.append(i)
    return added, removed, changed


def format_entry(
    added: list[str],
    removed: list[str],
    changed: list[str],
    new_fp: dict,
    *,
    bootstrap: bool = False,
) -> str:
    bullets: list[str] = []
    if bootstrap:
        bullets.append(
            f"- **Bootstrap** catalog fingerprint "
            f"({new_fp['endpoint_count']} endpoints)."
        )
        for i in sorted(new_fp.get("endpoints") or {}):
            ep = new_fp["endpoints"][i]
            access = ep.get("access") or "—"
            bullets.append(
                f"- Listed `{i}` — {ep.get('method')} `{ep.get('path')}` · access `{access}`"
            )
    else:
        for i in added:
            ep = new_fp["endpoints"][i]
            bullets.append(
                f"- **Added** `{i}` ({ep.get('method')} `{ep.get('path')}`)"
            )
        for i in removed:
            bullets.append(f"- **Removed** `{i}`")
        for i in changed:
            ep = new_fp["endpoints"][i]
            bullets.append(
                f"- **Changed** `{i}` ({ep.get('method')} `{ep.get('path')}` · "
                f"access `{ep.get('access') or '—'}`)"
            )
        if not bullets:
            bullets.append("- Catalog fingerprint updated (metadata / ordering).")
    return f"## {TODAY}\n\n" + "\n".join(bullets) + "\n"


def upsert_changelog(path: Path, entry: str) -> None:
    existing = path.read_text(encoding="utf-8") if path.exists() else "# Changelog\n\n"
    # Drop a same-day section if regenerating
    existing = re.sub(
        rf"\n## {re.escape(TODAY)}\n.*?(?=\n## |\Z)",
        "\n",
        existing,
        flags=re.S,
    )
    if not existing.lstrip().startswith("#"):
        existing = "# Changelog\n\n" + existing
    # Insert after H1
    m = re.match(r"(# [^\n]+\n)", existing)
    if m:
        rest = existing[m.end() :].lstrip("\n")
        body = m.group(1) + "\n" + entry + "\n" + rest
    else:
        body = "# Changelog\n\n" + entry + "\n" + existing
    # Ensure intro line once
    if "Automated from `catalog/endpoints.yaml`" not in body:
        body = body.replace(
            "# Changelog\n",
            "# Changelog\n\n"
            "Automated from `catalog/endpoints.yaml` via "
            "`scripts/update-api-catalog-changelog.py` "
            "(and `.github/workflows/catalog-changelog.yml` after extraction).\n",
            1,
        )
    path.write_text(body.rstrip() + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--force-bootstrap",
        action="store_true",
        help="Rewrite today's bootstrap entry even if fingerprint unchanged",
    )
    args = parser.parse_args()

    rollup_entries: list[dict] = []
    packages_meta: list[dict] = []

    for pkg_dir in sorted(p for p in ROOT.iterdir() if p.is_dir()):
        ep_path = pkg_dir / "catalog" / "endpoints.yaml"
        if not ep_path.exists():
            continue
        data = yaml.safe_load(ep_path.read_text(encoding="utf-8")) or {}
        new_fp = endpoint_fingerprint(data)
        fp_path = pkg_dir / "catalog" / ".endpoints.fingerprint.json"
        old_fp: dict = {}
        if fp_path.exists() and not args.force_bootstrap:
            old_fp = json.loads(fp_path.read_text(encoding="utf-8"))

        cl_path = pkg_dir / "CHANGELOG.md"
        wf_path = pkg_dir / ".github" / "workflows" / "catalog-changelog.yml"
        wf_path.parent.mkdir(parents=True, exist_ok=True)
        wf_path.write_text(WORKFLOW, encoding="utf-8")

        changed = old_fp.get("sha256") != new_fp["sha256"]
        is_first = not old_fp
        added, removed, chg = diff_fps(old_fp, new_fp)

        if is_first or args.force_bootstrap or changed:
            if is_first or (args.force_bootstrap and not changed and not (added or removed or chg)):
                entry = format_entry([], [], [], new_fp, bootstrap=True)
                is_bootstrap = True
            else:
                entry = format_entry(added, removed, chg, new_fp, bootstrap=False)
                is_bootstrap = False
            upsert_changelog(cl_path, entry)
            fp_path.write_text(json.dumps(new_fp, indent=2) + "\n", encoding="utf-8")
            rollup_entries.append(
                {
                    "slug": pkg_dir.name,
                    "date": TODAY,
                    "added": list(new_fp["endpoints"]) if is_bootstrap else added,
                    "removed": removed,
                    "changed": chg,
                    "endpoint_count": new_fp["endpoint_count"],
                    "bootstrap": is_bootstrap,
                }
            )
            action = "bootstrap" if is_bootstrap else "updated"
        else:
            action = "unchanged"
            if not cl_path.exists():
                upsert_changelog(
                    cl_path, format_entry([], [], [], new_fp, bootstrap=True)
                )

        packages_meta.append(
            {
                "slug": pkg_dir.name,
                "endpoint_count": new_fp["endpoint_count"],
                "sha256": new_fp["sha256"],
                "changelog": "CHANGELOG.md",
                "fingerprint": "catalog/.endpoints.fingerprint.json",
                "workflow": ".github/workflows/catalog-changelog.yml",
                "action": action,
            }
        )

    # Rollup CHANGELOG
    if rollup_entries or not ROLLUP_MD.exists():
        bullets = []
        for e in rollup_entries:
            if e.get("bootstrap"):
                bullets.append(
                    f"- **`{e['slug']}`** — bootstrap ({e['endpoint_count']} endpoints)"
                )
            else:
                bits = []
                if e["added"]:
                    bits.append(f"+{len(e['added'])}")
                if e["removed"]:
                    bits.append(f"-{len(e['removed'])}")
                if e["changed"]:
                    bits.append(f"~{len(e['changed'])}")
                bullets.append(
                    f"- **`{e['slug']}`** — {', '.join(bits) or 'metadata'} "
                    f"({e['endpoint_count']} endpoints)"
                )
        if not bullets:
            bullets.append("- No package catalog fingerprints changed this run.")
        entry = f"## {TODAY}\n\n" + "\n".join(bullets) + "\n"
        upsert_changelog(ROLLUP_MD, entry)
        # Fix rollup intro
        text = ROLLUP_MD.read_text(encoding="utf-8")
        text = text.replace(
            "Automated from `catalog/endpoints.yaml` via "
            "`scripts/update-api-catalog-changelog.py` "
            "(and `.github/workflows/catalog-changelog.yml` after extraction).",
            "Rollup of per-package catalog changelogs. "
            "Regenerate: `python3 scripts/update-api-catalog-changelog.py`. "
            "Each package also ships `.github/workflows/catalog-changelog.yml` "
            "for post-extraction automation.",
            1,
        )
        ROLLUP_MD.write_text(text, encoding="utf-8")

    payload = {
        "version": 1,
        "generated": TODAY,
        "packages": packages_meta,
        "recent_updates": rollup_entries,
    }
    JSON_OUT.parent.mkdir(parents=True, exist_ok=True)
    JSON_OUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    updated = sum(1 for p in packages_meta if p["action"] != "unchanged")
    print(f"packages={len(packages_meta)} updated={updated} rollup={len(rollup_entries)}")


if __name__ == "__main__":
    main()
