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
class UtilityReading:
    """Canonical fields — domain `utilities`."""

    group_id: str | None = None
    cluster_name: str | None = None
    schedule_window: str | None = None
    bill_total_lkr: float | None = None
    consumption: float | None = None
    gauge_level: float | None = None
    alert_status: str | None = None
    rainfall_mm: float | None = None
    as_of: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_mapping(cls, data: dict[str, Any] | None) -> "UtilityReading":
        if not data:
            return cls()
        kwargs = {}
        for src, dest in [
            ("groupId", "group_id"),
            ("group_id", "group_id"),
            ("clusterName", "cluster_name"),
            ("cluster_name", "cluster_name"),
            ("scheduleWindow", "schedule_window"),
            ("schedule_window", "schedule_window"),
            ("billTotalLkr", "bill_total_lkr"),
            ("bill_total_lkr", "bill_total_lkr"),
            ("consumption", "consumption"),
            ("consumption", "consumption"),
            ("gaugeLevel", "gauge_level"),
            ("gauge_level", "gauge_level"),
            ("alertStatus", "alert_status"),
            ("alert_status", "alert_status"),
            ("rainfallMm", "rainfall_mm"),
            ("rainfall_mm", "rainfall_mm"),
            ("asOf", "as_of"),
            ("as_of", "as_of"),
        ]:
            if src in data and dest not in kwargs:
                kwargs[dest] = data[src]
        return cls(**{k: v for k, v in kwargs.items() if k in cls.__dataclass_fields__})


__all__ = ['PageResult', 'UtilityReading']
