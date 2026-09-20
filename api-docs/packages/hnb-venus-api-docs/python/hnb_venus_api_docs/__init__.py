"""Minimal unofficial HTTP client for HNB Venus API.

Not affiliated with the upstream operator. Public reads only. Polite delays.
Generated from catalog/endpoints.yaml — regenerate via scripts/scaffold-py-clients.py
"""

from __future__ import annotations

import json
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse
from urllib.request import Request, urlopen

DEFAULT_UA = "hnb-venus-api-docs-unofficial/0.1 (+https://github.com/Cookie-Cat21/hnb-venus-api-docs; educational; polite)"
DEFAULT_BASE = "https://venus.hnb.lk/api"


class HnbVenusApiDocsClient:
    """Unofficial client — HNB Venus API."""

    slug = "hnb-venus-api-docs"
    title = "HNB Venus API"

    def __init__(
        self,
        *,
        base_url: str = DEFAULT_BASE,
        timeout: float = 30.0,
        default_delay_seconds: float = 1.0,
        user_agent: str = DEFAULT_UA,
        headers: dict[str, str] | None = None,
    ) -> None:
        self.base_url = (base_url or "").rstrip("/")
        self.timeout = timeout
        self.default_delay_seconds = default_delay_seconds
        self.user_agent = user_agent
        self._headers = {
            "Accept": "application/json, text/plain, */*",
            "User-Agent": user_agent,
            **(headers or {}),
        }

    def close(self) -> None:
        """No persistent connection — kept for cse-api-docs API symmetry."""

    def __enter__(self) -> "HnbVenusApiDocsClient":
        return self

    def __exit__(self, *args: object) -> None:
        self.close()

    def _with_query(self, url: str, params: dict[str, Any]) -> str:
        parsed = urlparse(url)
        q = dict(parse_qsl(parsed.query, keep_blank_values=True))
        for k, v in params.items():
            if v is None:
                continue
            q[str(k)] = str(v)
        return urlunparse(parsed._replace(query=urlencode(q)))

    def _resolve(self, url: str) -> str:
        if url.startswith("http://") or url.startswith("https://"):
            return url
        if not self.base_url:
            return url
        if not url.startswith("/"):
            url = "/" + url
        return self.base_url + url

    def _request_json(
        self,
        url: str,
        *,
        method: str = "GET",
        json_body: Any = None,
        delay_seconds: float | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        delay = self.default_delay_seconds if delay_seconds is None else delay_seconds
        if delay and delay > 0:
            time.sleep(delay)
        full = self._resolve(url)
        h = {**self._headers, **(headers or {})}
        data = None
        if json_body is not None and method.upper() not in {"GET", "HEAD"}:
            data = json.dumps(json_body).encode("utf-8")
            h.setdefault("Content-Type", "application/json")
        req = Request(full, data=data, headers=h, method=method.upper())
        try:
            with urlopen(req, timeout=self.timeout) as res:  # noqa: S310
                raw = res.read().decode("utf-8", "replace")
                status = getattr(res, "status", 200)
        except HTTPError as e:
            body = e.read().decode("utf-8", "replace")[:280]
            raise RuntimeError(f"{method} {full} -> {e.code}: {body}") from e
        except URLError as e:
            raise RuntimeError(f"{method} {full} failed: {e}") from e
        if not raw:
            return None
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return raw

    def get_exchange_rates_contents_web(self, **kwargs: Any) -> Any:
        """FX contents for web.

        Catalog id: `get_exchange_rates_contents_web` · GET
        """
        url = "https://venus.hnb.lk/api/get_exchange_rates_contents_web"
        payload: Any = None
        return self._request_json(url, method='GET', **kwargs)

    def get_all_web_card_promos(self, page: int = 1, limit: int = 50, **kwargs: Any) -> Any:
        """~841 card promos paginated.

        Catalog id: `get_all_web_card_promos` · GET
        """
        url = self._with_query("https://venus.hnb.lk/api/get_all_web_card_promos?page=1&limit=50&cardType=credit", {'page': page, 'limit': limit})
        payload: Any = None
        return self._request_json(url, method='GET', **kwargs)

    def get_interest_rates_contents(self, **kwargs: Any) -> Any:
        """Nested FD/savings/loans tables in table_data_approved.

        Catalog id: `get_interest_rates_contents` · GET
        """
        url = "https://venus.hnb.lk/api/get_interest_rates_contents"
        payload: Any = None
        return self._request_json(url, method='GET', **kwargs)

    def get_web_card_promo(self, **kwargs: Any) -> Any:
        """Single promo detail by id.

        Catalog id: `get_web_card_promo` · GET
        """
        url = "https://venus.hnb.lk/api/get_web_card_promo?id=1"
        payload: Any = None
        return self._request_json(url, method='GET', **kwargs)

    def get_rates_contents_web(self, **kwargs: Any) -> Any:
        """FX + deposit teaser with updated_on stamp.

        Catalog id: `get_rates_contents_web` · GET
        """
        url = "https://venus.hnb.lk/api/get_rates_contents_web"
        payload: Any = None
        return self._request_json(url, method='GET', **kwargs)

    def get_exchange_rate_last_update_date_contents(self, **kwargs: Any) -> Any:
        """As-of stamp for FX board.

        Catalog id: `get_exchange_rate_last_update_date_contents` · GET
        """
        url = "https://venus.hnb.lk/api/get_exchange_rate_last_update_date_contents"
        payload: Any = None
        return self._request_json(url, method='GET', **kwargs)

    def get_all_web_card_promos_debit(self, page: int = 1, limit: int = 50, **kwargs: Any) -> Any:
        """Debit card promos (~93); includes Glomark supermarket.

        Catalog id: `get_all_web_card_promos_debit` · GET
        """
        url = self._with_query("https://venus.hnb.lk/api/get_all_web_card_promos?page=1&limit=50&cardType=debit", {'page': page, 'limit': limit})
        payload: Any = None
        return self._request_json(url, method='GET', **kwargs)

# --- extras: models / pagination / shard ---
from .models import PageResult, FxTtQuote, FdDepositQuote, CardOffer
from .pagination import LAB_ENDPOINTS, iter_lab_endpoint, iter_pages
from .shard import (
    plan_shards,
    shard_groups,
    shard_offsets,
    shard_page_numbers,
    shard_range,
    shard_slice,
)

__all__ = [
    "HnbVenusApiDocsClient",
    "PageResult",
    "FxTtQuote",
    "FdDepositQuote",
    "CardOffer",
    "LAB_ENDPOINTS",
    "iter_lab_endpoint",
    "iter_pages",
    "plan_shards",
    "shard_groups",
    "shard_offsets",
    "shard_page_numbers",
    "shard_range",
    "shard_slice",
]
