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
class FdDepositQuote:
    """Canonical fields — domain `fd_deposits`."""

    tenor_months: int | None = None
    paid_in: str | None = None
    rate_pa: float | None = None
    aer_pa: float | None = None
    effective_from: str | None = None
    senior_citizen: bool | None = None
    product_code: str | None = None
    product_name: str | None = None
    currency: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_mapping(cls, data: dict[str, Any] | None) -> "FdDepositQuote":
        if not data:
            return cls()
        kwargs = {}
        for src, dest in [
            ("tenorMonths", "tenor_months"),
            ("tenor_months", "tenor_months"),
            ("paidIn", "paid_in"),
            ("paid_in", "paid_in"),
            ("ratePa", "rate_pa"),
            ("rate_pa", "rate_pa"),
            ("aerPa", "aer_pa"),
            ("aer_pa", "aer_pa"),
            ("effectiveFrom", "effective_from"),
            ("effective_from", "effective_from"),
            ("seniorCitizen", "senior_citizen"),
            ("senior_citizen", "senior_citizen"),
            ("productCode", "product_code"),
            ("product_code", "product_code"),
            ("productName", "product_name"),
            ("product_name", "product_name"),
            ("currency", "currency"),
            ("currency", "currency"),
        ]:
            if src in data and dest not in kwargs:
                kwargs[dest] = data[src]
        return cls(**{k: v for k, v in kwargs.items() if k in cls.__dataclass_fields__})


@dataclass
class CardOffer:
    """Canonical fields — domain `card_offers`."""

    bank: str | None = None
    merchant: str | None = None
    title: str | None = None
    discount_label: str | None = None
    weekday_hint: str | None = None
    valid_to: str | None = None
    card_type: str | None = None
    source_url: str | None = None
    as_of: str | None = None
    min_spend: float | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_mapping(cls, data: dict[str, Any] | None) -> "CardOffer":
        if not data:
            return cls()
        kwargs = {}
        for src, dest in [
            ("bank", "bank"),
            ("bank", "bank"),
            ("merchant", "merchant"),
            ("merchant", "merchant"),
            ("title", "title"),
            ("title", "title"),
            ("discountLabel", "discount_label"),
            ("discount_label", "discount_label"),
            ("weekdayHint", "weekday_hint"),
            ("weekday_hint", "weekday_hint"),
            ("validTo", "valid_to"),
            ("valid_to", "valid_to"),
            ("cardType", "card_type"),
            ("card_type", "card_type"),
            ("sourceUrl", "source_url"),
            ("source_url", "source_url"),
            ("asOf", "as_of"),
            ("as_of", "as_of"),
            ("minSpend", "min_spend"),
            ("min_spend", "min_spend"),
        ]:
            if src in data and dest not in kwargs:
                kwargs[dest] = data[src]
        return cls(**{k: v for k, v in kwargs.items() if k in cls.__dataclass_fields__})


__all__ = ['PageResult', 'FdDepositQuote', 'CardOffer']
