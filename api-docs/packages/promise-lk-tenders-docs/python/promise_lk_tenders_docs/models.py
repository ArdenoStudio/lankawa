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
class PlatformMisc:
    """Canonical fields — domain `platform_misc`."""

    tender_title: str | None = None
    closing_date: str | None = None
    district: str | None = None
    category: str | None = None
    health_ok: bool | None = None
    openapi_path: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_mapping(cls, data: dict[str, Any] | None) -> "PlatformMisc":
        if not data:
            return cls()
        kwargs = {}
        for src, dest in [
            ("tenderTitle", "tender_title"),
            ("tender_title", "tender_title"),
            ("closingDate", "closing_date"),
            ("closing_date", "closing_date"),
            ("district", "district"),
            ("district", "district"),
            ("category", "category"),
            ("category", "category"),
            ("healthOk", "health_ok"),
            ("health_ok", "health_ok"),
            ("openapiPath", "openapi_path"),
            ("openapi_path", "openapi_path"),
        ]:
            if src in data and dest not in kwargs:
                kwargs[dest] = data[src]
        return cls(**{k: v for k, v in kwargs.items() if k in cls.__dataclass_fields__})


__all__ = ['PageResult', 'PlatformMisc']
