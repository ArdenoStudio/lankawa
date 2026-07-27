"""Typed models for canonical Lankawa snapshot fields.

Generated from FIELD_COVERAGE_MATRIX — regenerate via scripts/scaffold-client-extras.py
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass
class PageResult:
    """One page from a pagination iterator."""

    page: int
    offset: int = 0
    limit: int = 0
    key: str | None = None
    items: list[Any] = field(default_factory=list)
    raw: Any = None
    done: bool = False

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class CseQuote:
    """Canonical fields — domain `markets_cse`."""

    symbol: str | None = None
    name: str | None = None
    last_price: float | None = None
    change: float | None = None
    change_pct: float | None = None
    volume: float | None = None
    sector: str | None = None
    as_of: str | None = None
    announcement_title: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_mapping(cls, data: dict[str, Any] | None) -> "CseQuote":
        if not data:
            return cls()
        kwargs = {}
        for src, dest in [
            ("symbol", "symbol"),
            ("symbol", "symbol"),
            ("name", "name"),
            ("name", "name"),
            ("lastPrice", "last_price"),
            ("last_price", "last_price"),
            ("change", "change"),
            ("change", "change"),
            ("changePct", "change_pct"),
            ("change_pct", "change_pct"),
            ("volume", "volume"),
            ("volume", "volume"),
            ("sector", "sector"),
            ("sector", "sector"),
            ("asOf", "as_of"),
            ("as_of", "as_of"),
            ("announcementTitle", "announcement_title"),
            ("announcement_title", "announcement_title"),
        ]:
            if src in data and dest not in kwargs:
                kwargs[dest] = data[src]
        return cls(**{k: v for k, v in kwargs.items() if k in cls.__dataclass_fields__})


__all__ = ['PageResult', 'CseQuote']
