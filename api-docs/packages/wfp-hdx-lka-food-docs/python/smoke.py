"""Quick client smoke — polite delay on."""

from __future__ import annotations

import json

from wfp_hdx_lka_food_docs import WfpHdxLkaFoodDocsClient


def json_preview(data: object, limit: int = 200) -> str:
    try:
        return json.dumps(data, ensure_ascii=False)[:limit]
    except TypeError:
        return str(data)[:limit]


with WfpHdxLkaFoodDocsClient(default_delay_seconds=1.0) as client:
    print("smoke", client.slug, "->", "wfp_food_prices_lka_csv")
    data = client.wfp_food_prices_lka_csv()
    preview = data[:200] if isinstance(data, str) else json_preview(data)
    print("ok", preview)
