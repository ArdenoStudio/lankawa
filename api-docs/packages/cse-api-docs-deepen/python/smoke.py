"""Quick client smoke — polite delay on."""

from __future__ import annotations

import json

from cse_api_docs_deepen import CseApiDocsDeepenClient


def json_preview(data: object, limit: int = 200) -> str:
    try:
        return json.dumps(data, ensure_ascii=False)[:limit]
    except TypeError:
        return str(data)[:limit]


with CseApiDocsDeepenClient(default_delay_seconds=1.0) as client:
    print("smoke", client.slug, "->", "top_gainers")
    data = client.top_gainers()
    preview = data[:200] if isinstance(data, str) else json_preview(data)
    print("ok", preview)
