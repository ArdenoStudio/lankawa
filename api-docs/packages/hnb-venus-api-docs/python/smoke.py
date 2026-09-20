"""Quick client smoke — polite delay on."""

from __future__ import annotations

import json

from hnb_venus_api_docs import HnbVenusApiDocsClient


def json_preview(data: object, limit: int = 200) -> str:
    try:
        return json.dumps(data, ensure_ascii=False)[:limit]
    except TypeError:
        return str(data)[:limit]


with HnbVenusApiDocsClient(default_delay_seconds=1.0) as client:
    print("smoke", client.slug, "->", "get_exchange_rates_contents_web")
    data = client.get_exchange_rates_contents_web()
    preview = data[:200] if isinstance(data, str) else json_preview(data)
    print("ok", preview)
