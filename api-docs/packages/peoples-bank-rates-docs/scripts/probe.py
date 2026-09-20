#!/usr/bin/env python3
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
