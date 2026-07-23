"""Pagination iterators for lab endpoints.

Generated — regenerate via scripts/scaffold-client-extras.py
"""

from __future__ import annotations

from collections.abc import Callable, Iterator
from typing import Any

from .models import PageResult

LAB_ENDPOINTS: list[dict[str, Any]] = [
  {
    "id": "card_offers_js",
    "method": "card_offers_js",
    "style": "client_array",
    "summary": "Offers page; arr_offers JS after Sucuri cookie."
  }
]

_CEB_GROUPS = list("ABCDEFGHIJKLMNOPQRSTUVWXY")


def _as_list(raw: Any) -> list[Any]:
    if raw is None:
        return []
    if isinstance(raw, list):
        return raw
    if isinstance(raw, dict):
        for key in (
            "data",
            "items",
            "results",
            "content",
            "features",
            "clusters",
            "reqTradeSummaryList",
            "offers",
            "records",
            "rows",
        ):
            val = raw.get(key)
            if isinstance(val, list):
                return val
        return [raw]
    return [raw]


def _is_empty(raw: Any, items: list[Any]) -> bool:
    if raw is None:
        return True
    if isinstance(raw, str) and not raw.strip():
        return True
    return len(items) == 0


def iter_pages(
    fetch_page: Callable[..., Any],
    *,
    style: str,
    start: int = 1,
    max_pages: int = 50,
    page_size: int = 50,
    extract_items: Callable[[Any], list[Any]] | None = None,
) -> Iterator[PageResult]:
    """Generic pagination iterator.

    ``fetch_page`` signatures by style:
    - page_limit / limit_page: ``(page, limit)``
    - page_number: ``(page_number, size)``
    - arcgis: ``(result_offset, result_record_count)``
    - group_id: ``(group_id,)``  — iterates A–Y
    - pageRequest: ``(index, limit)``  — 0-based index
    - client_slice / full_download / client_array / html_list / multi_host / time_window:
      single fetch then client-side chunking
    """
    extract = extract_items or _as_list
    style_l = (style or "page_limit").lower()

    if style_l in {"client_slice", "full_download", "client_array", "html_list", "multi_host", "time_window"}:
        raw = fetch_page()
        items = extract(raw)
        if not items:
            yield PageResult(page=0, offset=0, limit=page_size, items=[], raw=raw, done=True)
            return
        for i in range(0, len(items), page_size):
            chunk = items[i : i + page_size]
            page = i // page_size
            yield PageResult(
                page=page,
                offset=i,
                limit=page_size,
                items=chunk,
                raw=raw if page == 0 else chunk,
                done=i + page_size >= len(items),
            )
        return

    if style_l == "group_id":
        groups = _CEB_GROUPS[:max_pages]
        for idx, group in enumerate(groups):
            raw = fetch_page(group)
            items = extract(raw)
            yield PageResult(
                page=idx,
                offset=idx,
                limit=1,
                key=group,
                items=items,
                raw=raw,
                done=idx == len(groups) - 1,
            )
        return

    for i in range(max_pages):
        if style_l in {"page_limit", "limit_page"}:
            page = start + i
            raw = fetch_page(page, page_size)
            offset = (page - 1) * page_size
            key = str(page)
        elif style_l == "page_number":
            page = start + i
            raw = fetch_page(page, page_size)
            offset = (page - 1) * page_size
            key = str(page)
        elif style_l == "arcgis":
            offset = (start if start > 0 else 0) + i * page_size
            page = i
            raw = fetch_page(offset, page_size)
            key = str(offset)
        elif style_l == "pagerequest":
            index = (start if start >= 0 else 0) + i
            page = index
            offset = index * page_size
            raw = fetch_page(index, page_size)
            key = str(index)
        else:
            page = start + i
            raw = fetch_page(page, page_size)
            offset = (page - 1) * page_size
            key = str(page)

        items = extract(raw)
        empty = _is_empty(raw, items)
        yield PageResult(
            page=page if style_l != "arcgis" else i,
            offset=offset,
            limit=page_size,
            key=key,
            items=items,
            raw=raw,
            done=empty,
        )
        if empty:
            break
        if style_l == "arcgis" and len(items) < page_size:
            break
        if style_l == "pagerequest" and len(items) < page_size:
            break


def iter_lab_endpoint(
    client: Any,
    endpoint_id: str,
    *,
    start: int = 1,
    max_pages: int = 50,
    page_size: int = 50,
    **call_kwargs: Any,
) -> Iterator[PageResult]:
    """Iterate a catalog lab endpoint by id using the client method."""
    meta = next((m for m in LAB_ENDPOINTS if m["id"] == endpoint_id), None)
    if meta is None:
        raise KeyError(f"No lab endpoint {endpoint_id!r} for pabc-card-offers-docs")
    method_name = meta["method"]
    style = meta["style"]
    fn = getattr(client, method_name)

    def fetch_page(*args: Any) -> Any:
        if style.lower() == "group_id":
            return fn(args[0] if args else "A", **call_kwargs)
        if style.lower() in {"client_slice", "full_download", "client_array", "html_list", "multi_host", "time_window"}:
            return fn(**call_kwargs)
        if len(args) == 2:
            return fn(args[0], args[1], **call_kwargs)
        return fn(**call_kwargs)

    return iter_pages(
        fetch_page,
        style=style,
        start=start,
        max_pages=max_pages,
        page_size=page_size,
    )


__all__ = ["LAB_ENDPOINTS", "PageResult", "iter_pages", "iter_lab_endpoint"]
