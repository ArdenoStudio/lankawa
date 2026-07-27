#!/usr/bin/env python3
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
