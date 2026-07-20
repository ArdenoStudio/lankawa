"""Minimal unofficial HTTP client for Open-Meteo Sri Lanka Recipes.

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

DEFAULT_UA = "open-meteo-lk-docs-unofficial/0.1 (+https://github.com/Cookie-Cat21/open-meteo-lk-docs; educational; polite)"
DEFAULT_BASE = "https://api.open-meteo.com"


class OpenMeteoLkDocsClient:
    """Unofficial client — Open-Meteo Sri Lanka Recipes."""

    slug = "open-meteo-lk-docs"
    title = "Open-Meteo Sri Lanka Recipes"

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

    def __enter__(self) -> "OpenMeteoLkDocsClient":
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

    def forecast_colombo(self, **kwargs: Any) -> Any:
        """Colombo daily forecast.

        Catalog id: `forecast_colombo` · GET
        """
        url = "https://api.open-meteo.com/v1/forecast?latitude=6.9271&longitude=79.8612&daily=uv_index_max,precipitation_sum&timezone=Asia%2FColombo"
        payload: Any = None
        return self._request_json(url, method='GET', **kwargs)

    def air_quality_colombo(self, **kwargs: Any) -> Any:
        """Colombo air quality.

        Catalog id: `air_quality_colombo` · GET
        """
        url = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=6.9271&longitude=79.8612&hourly=pm2_5,us_aqi"
        payload: Any = None
        return self._request_json(url, method='GET', **kwargs)

    def marine_colombo(self, **kwargs: Any) -> Any:
        """Colombo marine wave height.

        Catalog id: `marine_colombo` · GET
        """
        url = "https://marine-api.open-meteo.com/v1/marine?latitude=6.9271&longitude=79.8612&hourly=wave_height"
        payload: Any = None
        return self._request_json(url, method='GET', **kwargs)


__all__ = ["OpenMeteoLkDocsClient"]
