"""Quick client smoke — polite delay on."""

from __future__ import annotations

import json

from sl_bank_fd_rates_docs import SlBankFdRatesDocsClient


def json_preview(data: object, limit: int = 200) -> str:
    try:
        return json.dumps(data, ensure_ascii=False)[:limit]
    except TypeError:
        return str(data)[:limit]


with SlBankFdRatesDocsClient(default_delay_seconds=1.0) as client:
    print("smoke", client.slug, "->", "pack_overview")
    data = client.pack_overview()
    preview = data[:200] if isinstance(data, str) else json_preview(data)
    print("ok", preview)
