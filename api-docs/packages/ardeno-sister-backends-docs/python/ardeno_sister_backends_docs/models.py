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
class FoodPrice:
    """Canonical fields — domain `food_prices`."""

    commodity: str | None = None
    unit: str | None = None
    price_lkr: float | None = None
    market_or_district: str | None = None
    as_of: str | None = None
    currency: str | None = None
    source_lag: str | None = None
    basket_id: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_mapping(cls, data: dict[str, Any] | None) -> "FoodPrice":
        if not data:
            return cls()
        kwargs = {}
        for src, dest in [
            ("commodity", "commodity"),
            ("commodity", "commodity"),
            ("unit", "unit"),
            ("unit", "unit"),
            ("priceLkr", "price_lkr"),
            ("price_lkr", "price_lkr"),
            ("marketOrDistrict", "market_or_district"),
            ("market_or_district", "market_or_district"),
            ("asOf", "as_of"),
            ("as_of", "as_of"),
            ("currency", "currency"),
            ("currency", "currency"),
            ("sourceLag", "source_lag"),
            ("source_lag", "source_lag"),
            ("basketId", "basket_id"),
            ("basket_id", "basket_id"),
        ]:
            if src in data and dest not in kwargs:
                kwargs[dest] = data[src]
        return cls(**{k: v for k, v in kwargs.items() if k in cls.__dataclass_fields__})


@dataclass
class FuelEnergy:
    """Canonical fields — domain `fuel_energy`."""

    product: str | None = None
    price_lkr: float | None = None
    unit: str | None = None
    as_of: str | None = None
    world_compare: str | None = None
    emi_bank: str | None = None
    emi_tenor_months: int | None = None
    emi_monthly_lkr: float | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_mapping(cls, data: dict[str, Any] | None) -> "FuelEnergy":
        if not data:
            return cls()
        kwargs = {}
        for src, dest in [
            ("product", "product"),
            ("product", "product"),
            ("priceLkr", "price_lkr"),
            ("price_lkr", "price_lkr"),
            ("unit", "unit"),
            ("unit", "unit"),
            ("asOf", "as_of"),
            ("as_of", "as_of"),
            ("worldCompare", "world_compare"),
            ("world_compare", "world_compare"),
            ("emiBank", "emi_bank"),
            ("emi_bank", "emi_bank"),
            ("emiTenorMonths", "emi_tenor_months"),
            ("emi_tenor_months", "emi_tenor_months"),
            ("emiMonthlyLkr", "emi_monthly_lkr"),
            ("emi_monthly_lkr", "emi_monthly_lkr"),
        ]:
            if src in data and dest not in kwargs:
                kwargs[dest] = data[src]
        return cls(**{k: v for k, v in kwargs.items() if k in cls.__dataclass_fields__})


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


__all__ = ['PageResult', 'FoodPrice', 'FuelEnergy', 'PlatformMisc']
