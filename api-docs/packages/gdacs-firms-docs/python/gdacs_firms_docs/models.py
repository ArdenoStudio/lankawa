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
class WeatherAqi:
    """Canonical fields — domain `weather_aqi`."""

    temp_c: float | None = None
    precip_mm: float | None = None
    uv_index: float | None = None
    pm25: float | None = None
    us_aqi: float | None = None
    warning_level: str | None = None
    cap_language: str | None = None
    as_of: str | None = None
    lat_lon: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_mapping(cls, data: dict[str, Any] | None) -> "WeatherAqi":
        if not data:
            return cls()
        kwargs = {}
        for src, dest in [
            ("tempC", "temp_c"),
            ("temp_c", "temp_c"),
            ("precipMm", "precip_mm"),
            ("precip_mm", "precip_mm"),
            ("uvIndex", "uv_index"),
            ("uv_index", "uv_index"),
            ("pm25", "pm25"),
            ("pm25", "pm25"),
            ("usAqi", "us_aqi"),
            ("us_aqi", "us_aqi"),
            ("warningLevel", "warning_level"),
            ("warning_level", "warning_level"),
            ("capLanguage", "cap_language"),
            ("cap_language", "cap_language"),
            ("asOf", "as_of"),
            ("as_of", "as_of"),
            ("latLon", "lat_lon"),
            ("lat_lon", "lat_lon"),
        ]:
            if src in data and dest not in kwargs:
                kwargs[dest] = data[src]
        return cls(**{k: v for k, v in kwargs.items() if k in cls.__dataclass_fields__})


__all__ = ['PageResult', 'WeatherAqi']
