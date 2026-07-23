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
class FxTtQuote:
    """Canonical fields — domain `fx_tt`."""

    buy_lkr: float | None = None
    sell_lkr: float | None = None
    as_of: str | None = None
    spread_lkr: float | None = None
    currency: str | None = None
    tt_buy: float | None = None
    tt_sell: float | None = None
    dd_buy: float | None = None
    dd_sell: float | None = None
    cheque_buy: float | None = None
    cheque_sell: float | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_mapping(cls, data: dict[str, Any] | None) -> "FxTtQuote":
        if not data:
            return cls()
        kwargs = {}
        for src, dest in [
            ("buyLkr", "buy_lkr"),
            ("buy_lkr", "buy_lkr"),
            ("sellLkr", "sell_lkr"),
            ("sell_lkr", "sell_lkr"),
            ("asOf", "as_of"),
            ("as_of", "as_of"),
            ("spreadLkr", "spread_lkr"),
            ("spread_lkr", "spread_lkr"),
            ("currency", "currency"),
            ("currency", "currency"),
            ("ttBuy", "tt_buy"),
            ("tt_buy", "tt_buy"),
            ("ttSell", "tt_sell"),
            ("tt_sell", "tt_sell"),
            ("ddBuy", "dd_buy"),
            ("dd_buy", "dd_buy"),
            ("ddSell", "dd_sell"),
            ("dd_sell", "dd_sell"),
            ("chequeBuy", "cheque_buy"),
            ("cheque_buy", "cheque_buy"),
            ("chequeSell", "cheque_sell"),
            ("cheque_sell", "cheque_sell"),
        ]:
            if src in data and dest not in kwargs:
                kwargs[dest] = data[src]
        return cls(**{k: v for k, v in kwargs.items() if k in cls.__dataclass_fields__})


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


__all__ = ['PageResult', 'FxTtQuote', 'FdDepositQuote', 'MacroCbsl']
