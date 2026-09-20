"""Shard helpers for parallel probes / crawls.

Split page ranges, CEB groups, or offset windows across workers.
Generated — regenerate via scripts/scaffold-client-extras.py
"""

from __future__ import annotations

from typing import TypeVar

T = TypeVar("T")

_CEB_GROUPS = list("ABCDEFGHIJKLMNOPQRSTUVWXY")


def shard_slice(items: list[T], shard_index: int, shard_count: int) -> list[T]:
    """Return the slice of ``items`` owned by ``shard_index`` (0-based)."""
    if shard_count < 1:
        raise ValueError("shard_count must be >= 1")
    if shard_index < 0 or shard_index >= shard_count:
        raise ValueError("shard_index out of range")
    return [item for i, item in enumerate(items) if i % shard_count == shard_index]


def shard_range(
    start: int,
    end: int,
    shard_index: int,
    shard_count: int,
) -> tuple[int, int]:
    """Inclusive-exclusive ``[lo, hi)`` page/index range for this shard."""
    if end < start:
        raise ValueError("end must be >= start")
    if shard_count < 1:
        raise ValueError("shard_count must be >= 1")
    total = end - start
    base = total // shard_count
    rem = total % shard_count
    lo = start + shard_index * base + min(shard_index, rem)
    hi = lo + base + (1 if shard_index < rem else 0)
    return lo, hi


def shard_page_numbers(
    start_page: int,
    end_page: int,
    shard_index: int,
    shard_count: int,
) -> list[int]:
    """Page numbers (inclusive end) for this shard."""
    lo, hi = shard_range(start_page, end_page + 1, shard_index, shard_count)
    return list(range(lo, hi))


def shard_offsets(
    total_records: int,
    page_size: int,
    shard_index: int,
    shard_count: int,
) -> list[int]:
    """ArcGIS-style resultOffset values for this shard."""
    if page_size < 1:
        raise ValueError("page_size must be >= 1")
    offsets = list(range(0, max(total_records, 0), page_size))
    return shard_slice(offsets, shard_index, shard_count)


def shard_groups(
    shard_index: int,
    shard_count: int,
    groups: list[str] | None = None,
) -> list[str]:
    """CEB LoadShedGroupId letters (default A–Y) for this shard."""
    return shard_slice(list(groups or _CEB_GROUPS), shard_index, shard_count)


def plan_shards(shard_count: int) -> list[dict[str, int]]:
    """Describe shard workers as ``[{index, count}, ...]``."""
    return [{"index": i, "count": shard_count} for i in range(shard_count)]


__all__ = [
    "plan_shards",
    "shard_groups",
    "shard_offsets",
    "shard_page_numbers",
    "shard_range",
    "shard_slice",
]
