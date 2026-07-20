"""Quick client smoke — polite delay on."""

from __future__ import annotations

import json

from ardeno_sister_backends_docs import ArdenoSisterBackendsDocsClient


def json_preview(data: object, limit: int = 200) -> str:
    try:
        return json.dumps(data, ensure_ascii=False)[:limit]
    except TypeError:
        return str(data)[:limit]


with ArdenoSisterBackendsDocsClient(default_delay_seconds=1.0) as client:
    print("smoke", client.slug, "->", "foodlk_openapi")
    data = client.foodlk_openapi()
    preview = data[:200] if isinstance(data, str) else json_preview(data)
    print("ok", preview)
