"""Quick client smoke — polite delay on."""

from __future__ import annotations

import json

from gdacs_firms_docs import GdacsFirmsDocsClient


def json_preview(data: object, limit: int = 200) -> str:
    try:
        return json.dumps(data, ensure_ascii=False)[:limit]
    except TypeError:
        return str(data)[:limit]


with GdacsFirmsDocsClient(default_delay_seconds=1.0) as client:
    print("smoke", client.slug, "->", "gdacs_events_rss")
    data = client.gdacs_events_rss()
    preview = data[:200] if isinstance(data, str) else json_preview(data)
    print("ok", preview)
