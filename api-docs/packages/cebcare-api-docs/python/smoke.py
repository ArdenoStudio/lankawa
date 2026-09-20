"""Quick client smoke — polite delay on."""

from __future__ import annotations

import json

from cebcare_api_docs import CebcareApiDocsClient


def json_preview(data: object, limit: int = 200) -> str:
    try:
        return json.dumps(data, ensure_ascii=False)[:limit]
    except TypeError:
        return str(data)[:limit]


with CebcareApiDocsClient(default_delay_seconds=1.0) as client:
    print("smoke", client.slug, "->", "demand_mgmt_schedule")
    data = client.demand_mgmt_schedule()
    preview = data[:200] if isinstance(data, str) else json_preview(data)
    print("ok", preview)
