"""Quick client smoke — polite delay on."""

from __future__ import annotations

import json

from octane_fuel_api_docs import OctaneFuelApiDocsClient


def json_preview(data: object, limit: int = 200) -> str:
    try:
        return json.dumps(data, ensure_ascii=False)[:limit]
    except TypeError:
        return str(data)[:limit]


with OctaneFuelApiDocsClient(default_delay_seconds=1.0) as client:
    print("smoke", client.slug, "->", "prices_latest")
    data = client.prices_latest()
    preview = data[:200] if isinstance(data, str) else json_preview(data)
    print("ok", preview)
