"""Quick client smoke — polite delay on."""

from __future__ import annotations

import json

from visa_lk_perks_api_docs import VisaLkPerksApiDocsClient


def json_preview(data: object, limit: int = 200) -> str:
    try:
        return json.dumps(data, ensure_ascii=False)[:limit]
    except TypeError:
        return str(data)[:limit]


with VisaLkPerksApiDocsClient(default_delay_seconds=1.0) as client:
    print("smoke", client.slug, "->", "portal_perks")
    data = client.portal_perks()
    preview = data[:200] if isinstance(data, str) else json_preview(data)
    print("ok", preview)
