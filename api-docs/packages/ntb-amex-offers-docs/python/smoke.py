"""Quick client smoke — polite delay on."""

from __future__ import annotations

import json

from ntb_amex_offers_docs import NtbAmexOffersDocsClient


def json_preview(data: object, limit: int = 200) -> str:
    try:
        return json.dumps(data, ensure_ascii=False)[:limit]
    except TypeError:
        return str(data)[:limit]


with NtbAmexOffersDocsClient(default_delay_seconds=1.0) as client:
    print("smoke", client.slug, "->", "ntb_promotions_hub")
    data = client.ntb_promotions_hub()
    preview = data[:200] if isinstance(data, str) else json_preview(data)
    print("ok", preview)
