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
class MacroCbsl:
    """Canonical fields — domain `macro_cbsl`."""

    opr: float | None = None
    sdfr: float | None = None
    slfr: float | None = None
    awpr: float | None = None
    tbill_yield: float | None = None
    gold_price: float | None = None
    as_of: str | None = None
    bulletin_url: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_mapping(cls, data: dict[str, Any] | None) -> "MacroCbsl":
        if not data:
            return cls()
        kwargs = {}
        for src, dest in [
            ("opr", "opr"),
            ("opr", "opr"),
            ("sdfr", "sdfr"),
            ("sdfr", "sdfr"),
            ("slfr", "slfr"),
            ("slfr", "slfr"),
            ("awpr", "awpr"),
            ("awpr", "awpr"),
            ("tbillYield", "tbill_yield"),
            ("tbill_yield", "tbill_yield"),
            ("goldPrice", "gold_price"),
            ("gold_price", "gold_price"),
            ("asOf", "as_of"),
            ("as_of", "as_of"),
            ("bulletinUrl", "bulletin_url"),
            ("bulletin_url", "bulletin_url"),
        ]:
            if src in data and dest not in kwargs:
                kwargs[dest] = data[src]
        return cls(**{k: v for k, v in kwargs.items() if k in cls.__dataclass_fields__})


__all__ = ['PageResult', 'MacroCbsl']
