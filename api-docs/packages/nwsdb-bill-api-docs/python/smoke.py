"""Quick client smoke — polite delay on."""

from __future__ import annotations

import json

from nwsdb_bill_api_docs import NwsdbBillApiDocsClient


def json_preview(data: object, limit: int = 200) -> str:
    try:
        return json.dumps(data, ensure_ascii=False)[:limit]
    except TypeError:
        return str(data)[:limit]


with NwsdbBillApiDocsClient(default_delay_seconds=1.0) as client:
    print("smoke", client.slug, "->", "bill_calculator")
    data = client.bill_calculator()
    preview = data[:200] if isinstance(data, str) else json_preview(data)
    print("ok", preview)
