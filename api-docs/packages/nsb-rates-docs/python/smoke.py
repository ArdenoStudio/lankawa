"""Quick client smoke — polite delay on."""

from __future__ import annotations

import json

from nsb_rates_docs import NsbRatesDocsClient


def json_preview(data: object, limit: int = 200) -> str:
    try:
        return json.dumps(data, ensure_ascii=False)[:limit]
    except TypeError:
        return str(data)[:limit]


with NsbRatesDocsClient(default_delay_seconds=1.0) as client:
    print("smoke", client.slug, "->", "deposit_rates_html")
    data = client.deposit_rates_html()
    preview = data[:200] if isinstance(data, str) else json_preview(data)
    print("ok", preview)
