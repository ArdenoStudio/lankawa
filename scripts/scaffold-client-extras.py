#!/usr/bin/env python3
"""Add typed models, pagination iterators, and shard helpers to all api-docs clients."""
from __future__ import annotations

import json
import re
from pathlib import Path

import yaml

ROOT = Path("api-docs/packages")
COVERAGE = Path("api-docs/FIELD_COVERAGE_MATRIX.yaml")
INDEX_OUT = Path("api-docs/CLIENT_EXTRAS.md")
JSON_OUT = Path("src/lib/api-docs-client-extras.json")

# Canonical domain fields → snake_case Python / camelCase TS
DOMAIN_FIELD_TYPES: dict[str, dict[str, str]] = {
    "fx_tt": {
        "buyLkr": "float",
        "sellLkr": "float",
        "asOf": "str",
        "spreadLkr": "float",
        "currency": "str",
        "ttBuy": "float",
        "ttSell": "float",
        "ddBuy": "float",
        "ddSell": "float",
        "chequeBuy": "float",
        "chequeSell": "float",
    },
    "fd_deposits": {
        "tenorMonths": "int",
        "paidIn": "str",
        "ratePa": "float",
        "aerPa": "float",
        "effectiveFrom": "str",
        "seniorCitizen": "bool",
        "productCode": "str",
        "productName": "str",
        "currency": "str",
    },
    "card_offers": {
        "bank": "str",
        "merchant": "str",
        "title": "str",
        "discountLabel": "str",
        "weekdayHint": "str",
        "validTo": "str",
        "cardType": "str",
        "sourceUrl": "str",
        "asOf": "str",
        "minSpend": "float",
    },
    "food_prices": {
        "commodity": "str",
        "unit": "str",
        "priceLkr": "float",
        "marketOrDistrict": "str",
        "asOf": "str",
        "currency": "str",
        "sourceLag": "str",
        "basketId": "str",
    },
    "markets_cse": {
        "symbol": "str",
        "name": "str",
        "lastPrice": "float",
        "change": "float",
        "changePct": "float",
        "volume": "float",
        "sector": "str",
        "asOf": "str",
        "announcementTitle": "str",
    },
    "utilities": {
        "groupId": "str",
        "clusterName": "str",
        "scheduleWindow": "str",
        "billTotalLkr": "float",
        "consumption": "float",
        "gaugeLevel": "float",
        "alertStatus": "str",
        "rainfallMm": "float",
        "asOf": "str",
    },
    "weather_aqi": {
        "tempC": "float",
        "precipMm": "float",
        "uvIndex": "float",
        "pm25": "float",
        "usAqi": "float",
        "warningLevel": "str",
        "capLanguage": "str",
        "asOf": "str",
        "latLon": "str",
    },
    "fuel_energy": {
        "product": "str",
        "priceLkr": "float",
        "unit": "str",
        "asOf": "str",
        "worldCompare": "str",
        "emiBank": "str",
        "emiTenorMonths": "int",
        "emiMonthlyLkr": "float",
    },
    "macro_cbsl": {
        "opr": "float",
        "sdfr": "float",
        "slfr": "float",
        "awpr": "float",
        "tbillYield": "float",
        "goldPrice": "float",
        "asOf": "str",
        "bulletinUrl": "str",
    },
    "platform_misc": {
        "tenderTitle": "str",
        "closingDate": "str",
        "district": "str",
        "category": "str",
        "healthOk": "bool",
        "openapiPath": "str",
    },
}

DOMAIN_MODEL_NAMES = {
    "fx_tt": "FxTtQuote",
    "fd_deposits": "FdDepositQuote",
    "card_offers": "CardOffer",
    "food_prices": "FoodPrice",
    "markets_cse": "CseQuote",
    "utilities": "UtilityReading",
    "weather_aqi": "WeatherAqi",
    "fuel_energy": "FuelEnergy",
    "macro_cbsl": "MacroCbsl",
    "platform_misc": "PlatformMisc",
}


def module_name(slug: str) -> str:
    name = re.sub(r"[^a-zA-Z0-9]+", "_", slug).strip("_").lower()
    if name and name[0].isdigit():
        name = "pkg_" + name
    return name


def class_name(slug: str) -> str:
    parts = re.split(r"[^a-zA-Z0-9]+", slug)
    return "".join(p[:1].upper() + p[1:] for p in parts if p) + "Client"


def snake(s: str) -> str:
    out = []
    for i, ch in enumerate(s):
        if ch.isupper() and i:
            out.append("_")
            out.append(ch.lower())
        else:
            out.append(ch.lower() if ch.isupper() else ch)
    return "".join(out).replace("__", "_")


def camel_method(s: str) -> str:
    name = re.sub(r"[^a-zA-Z0-9]+", "_", s).strip("_").lower()
    if name and name[0].isdigit():
        name = "e_" + name
    return name


def ts_type(py: str) -> str:
    return {"float": "number", "int": "number", "str": "string", "bool": "boolean"}.get(
        py, "unknown"
    )


def py_optional(py: str) -> str:
    return f"{py} | None"


def load_coverage() -> dict:
    return yaml.safe_load(COVERAGE.read_text())


def domains_for_slug(coverage: dict, slug: str) -> list[str]:
    out = []
    for domain_id, domain in coverage.get("domains", {}).items():
        if slug in domain.get("packages", {}):
            out.append(domain_id)
    return out


def lab_endpoints(catalog: dict) -> list[dict]:
    out = []
    for ep in catalog.get("endpoints") or []:
        pag = ep.get("pagination")
        if isinstance(pag, dict) and pag.get("lab"):
            out.append(ep)
    return out


# --- Python generators ---


def render_py_models(slug: str, domain_ids: list[str]) -> str:
    lines = [
        '"""Typed models for canonical Lankawa snapshot fields.',
        "",
        "Generated from FIELD_COVERAGE_MATRIX — regenerate via scripts/scaffold-client-extras.py",
        '"""',
        "",
        "from __future__ import annotations",
        "",
        "from dataclasses import asdict, dataclass, field",
        "from typing import Any",
        "",
        "",
        "@dataclass",
        "class PageResult:",
        '    """One page from a pagination iterator."""',
        "",
        "    page: int",
        "    offset: int = 0",
        "    limit: int = 0",
        "    key: str | None = None",
        "    items: list[Any] = field(default_factory=list)",
        "    raw: Any = None",
        "    done: bool = False",
        "",
        "    def to_dict(self) -> dict[str, Any]:",
        "        return asdict(self)",
        "",
    ]
    exports = ["PageResult"]
    for domain_id in domain_ids:
        fields = DOMAIN_FIELD_TYPES.get(domain_id, {})
        model = DOMAIN_MODEL_NAMES.get(domain_id, domain_id.title().replace("_", ""))
        exports.append(model)
        lines += ["", "@dataclass", f"class {model}:", f'    """Canonical fields — domain `{domain_id}`."""', ""]
        if not fields:
            lines.append("    pass")
            continue
        for fname, ftype in fields.items():
            lines.append(f"    {snake(fname)}: {py_optional(ftype)} = None")
        lines += [
            "",
            "    def to_dict(self) -> dict[str, Any]:",
            "        return asdict(self)",
            "",
            "    @classmethod",
            "    def from_mapping(cls, data: dict[str, Any] | None) -> "
            + f'"{model}":',
            "        if not data:",
            "            return cls()",
            "        kwargs = {}",
            "        for src, dest in [",
        ]
        for fname in fields:
            lines.append(f'            ("{fname}", "{snake(fname)}"),')
            lines.append(f'            ("{snake(fname)}", "{snake(fname)}"),')
        lines += [
            "        ]:",
            "            if src in data and dest not in kwargs:",
            "                kwargs[dest] = data[src]",
            "        return cls(**{k: v for k, v in kwargs.items() if k in cls.__dataclass_fields__})",
            "",
        ]
    lines += ["", f"__all__ = {exports!r}", ""]
    return "\n".join(lines)


def render_py_pagination(slug: str, labs: list[dict]) -> str:
    methods_meta = []
    for ep in labs:
        methods_meta.append(
            {
                "id": ep["id"],
                "method": camel_method(ep["id"]),
                "style": (ep.get("pagination") or {}).get("style") or "page_limit",
                "summary": ep.get("summary") or "",
            }
        )
    meta_json = json.dumps(methods_meta, indent=2)
    return f'''"""Pagination iterators for lab endpoints.

Generated — regenerate via scripts/scaffold-client-extras.py
"""

from __future__ import annotations

from collections.abc import Callable, Iterator
from typing import Any

from .models import PageResult

LAB_ENDPOINTS: list[dict[str, Any]] = {meta_json}

_CEB_GROUPS = list("ABCDEFGHIJKLMNOPQRSTUVWXY")


def _as_list(raw: Any) -> list[Any]:
    if raw is None:
        return []
    if isinstance(raw, list):
        return raw
    if isinstance(raw, dict):
        for key in (
            "data",
            "items",
            "results",
            "content",
            "features",
            "clusters",
            "reqTradeSummaryList",
            "offers",
            "records",
            "rows",
        ):
            val = raw.get(key)
            if isinstance(val, list):
                return val
        return [raw]
    return [raw]


def _is_empty(raw: Any, items: list[Any]) -> bool:
    if raw is None:
        return True
    if isinstance(raw, str) and not raw.strip():
        return True
    return len(items) == 0


def iter_pages(
    fetch_page: Callable[..., Any],
    *,
    style: str,
    start: int = 1,
    max_pages: int = 50,
    page_size: int = 50,
    extract_items: Callable[[Any], list[Any]] | None = None,
) -> Iterator[PageResult]:
    """Generic pagination iterator.

    ``fetch_page`` signatures by style:
    - page_limit / limit_page: ``(page, limit)``
    - page_number: ``(page_number, size)``
    - arcgis: ``(result_offset, result_record_count)``
    - group_id: ``(group_id,)``  — iterates A–Y
    - pageRequest: ``(index, limit)``  — 0-based index
    - client_slice / full_download / client_array / html_list / multi_host / time_window:
      single fetch then client-side chunking
    """
    extract = extract_items or _as_list
    style_l = (style or "page_limit").lower()

    if style_l in {{"client_slice", "full_download", "client_array", "html_list", "multi_host", "time_window"}}:
        raw = fetch_page()
        items = extract(raw)
        if not items:
            yield PageResult(page=0, offset=0, limit=page_size, items=[], raw=raw, done=True)
            return
        for i in range(0, len(items), page_size):
            chunk = items[i : i + page_size]
            page = i // page_size
            yield PageResult(
                page=page,
                offset=i,
                limit=page_size,
                items=chunk,
                raw=raw if page == 0 else chunk,
                done=i + page_size >= len(items),
            )
        return

    if style_l == "group_id":
        groups = _CEB_GROUPS[:max_pages]
        for idx, group in enumerate(groups):
            raw = fetch_page(group)
            items = extract(raw)
            yield PageResult(
                page=idx,
                offset=idx,
                limit=1,
                key=group,
                items=items,
                raw=raw,
                done=idx == len(groups) - 1,
            )
        return

    for i in range(max_pages):
        if style_l in {{"page_limit", "limit_page"}}:
            page = start + i
            raw = fetch_page(page, page_size)
            offset = (page - 1) * page_size
            key = str(page)
        elif style_l == "page_number":
            page = start + i
            raw = fetch_page(page, page_size)
            offset = (page - 1) * page_size
            key = str(page)
        elif style_l == "arcgis":
            offset = (start if start > 0 else 0) + i * page_size
            page = i
            raw = fetch_page(offset, page_size)
            key = str(offset)
        elif style_l == "pagerequest":
            index = (start if start >= 0 else 0) + i
            page = index
            offset = index * page_size
            raw = fetch_page(index, page_size)
            key = str(index)
        else:
            page = start + i
            raw = fetch_page(page, page_size)
            offset = (page - 1) * page_size
            key = str(page)

        items = extract(raw)
        empty = _is_empty(raw, items)
        yield PageResult(
            page=page if style_l != "arcgis" else i,
            offset=offset,
            limit=page_size,
            key=key,
            items=items,
            raw=raw,
            done=empty,
        )
        if empty:
            break
        if style_l == "arcgis" and len(items) < page_size:
            break
        if style_l == "pagerequest" and len(items) < page_size:
            break


def iter_lab_endpoint(
    client: Any,
    endpoint_id: str,
    *,
    start: int = 1,
    max_pages: int = 50,
    page_size: int = 50,
    **call_kwargs: Any,
) -> Iterator[PageResult]:
    """Iterate a catalog lab endpoint by id using the client method."""
    meta = next((m for m in LAB_ENDPOINTS if m["id"] == endpoint_id), None)
    if meta is None:
        raise KeyError(f"No lab endpoint {{endpoint_id!r}} for {slug}")
    method_name = meta["method"]
    style = meta["style"]
    fn = getattr(client, method_name)

    def fetch_page(*args: Any) -> Any:
        if style.lower() == "group_id":
            return fn(args[0] if args else "A", **call_kwargs)
        if style.lower() in {{"client_slice", "full_download", "client_array", "html_list", "multi_host", "time_window"}}:
            return fn(**call_kwargs)
        if len(args) == 2:
            return fn(args[0], args[1], **call_kwargs)
        return fn(**call_kwargs)

    return iter_pages(
        fetch_page,
        style=style,
        start=start,
        max_pages=max_pages,
        page_size=page_size,
    )


__all__ = ["LAB_ENDPOINTS", "PageResult", "iter_pages", "iter_lab_endpoint"]
'''


def render_py_shard() -> str:
    return '''"""Shard helpers for parallel probes / crawls.

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
'''


# --- TypeScript / JS ---


def render_ts_models(domain_ids: list[str]) -> str:
    lines = [
        "/** Typed models for canonical Lankawa snapshot fields. */",
        "",
        "export type PageResult<T = unknown> = {",
        "  page: number;",
        "  offset?: number;",
        "  limit?: number;",
        "  key?: string;",
        "  items: T[];",
        "  raw?: unknown;",
        "  done?: boolean;",
        "};",
        "",
    ]
    for domain_id in domain_ids:
        model = DOMAIN_MODEL_NAMES.get(domain_id, "Model")
        fields = DOMAIN_FIELD_TYPES.get(domain_id, {})
        lines.append(f"/** Canonical fields — domain `{domain_id}` */")
        lines.append(f"export type {model} = {{")
        for fname, ftype in fields.items():
            lines.append(f"  {fname}?: {ts_type(ftype)} | null;")
        lines.append("};")
        lines.append("")
    return "\n".join(lines)


def render_ts_pagination(slug: str, labs: list[dict]) -> str:
    methods_meta = [
        {
            "id": ep["id"],
            "method": _ts_method(ep["id"]),
            "style": (ep.get("pagination") or {}).get("style") or "page_limit",
        }
        for ep in labs
    ]
    return f'''/** Pagination iterators for lab endpoints. */
import type {{ PageResult }} from "./models.js";

export type LabEndpointMeta = {{
  id: string;
  method: string;
  style: string;
}};

export const LAB_ENDPOINTS: LabEndpointMeta[] = {json.dumps(methods_meta, indent=2)};

const CEB_GROUPS = "ABCDEFGHIJKLMNOPQRSTUVWXY".split("");

function asList(raw: unknown): unknown[] {{
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object") {{
    const obj = raw as Record<string, unknown>;
    for (const key of ["data", "items", "results", "content", "features", "clusters", "reqTradeSummaryList", "offers", "records", "rows"]) {{
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }}
    return [raw];
  }}
  return [raw];
}}

export type FetchPage = (...args: any[]) => Promise<unknown>;

export async function* iterPages(
  fetchPage: FetchPage,
  options: {{
    style: string;
    start?: number;
    maxPages?: number;
    pageSize?: number;
  }},
): AsyncGenerator<PageResult> {{
  const style = (options.style || "page_limit").toLowerCase();
  const start = options.start ?? 1;
  const maxPages = options.maxPages ?? 50;
  const pageSize = options.pageSize ?? 50;

  if (["client_slice", "full_download", "client_array", "html_list", "multi_host", "time_window"].includes(style)) {{
    const raw = await fetchPage();
    const items = asList(raw);
    if (items.length === 0) {{
      yield {{ page: 0, offset: 0, limit: pageSize, items: [], raw, done: true }};
      return;
    }}
    for (let i = 0; i < items.length; i += pageSize) {{
      const chunk = items.slice(i, i + pageSize);
      const page = Math.floor(i / pageSize);
      yield {{
        page,
        offset: i,
        limit: pageSize,
        items: chunk,
        raw: page === 0 ? raw : chunk,
        done: i + pageSize >= items.length,
      }};
    }}
    return;
  }}

  if (style === "group_id") {{
    const groups = CEB_GROUPS.slice(0, maxPages);
    for (let idx = 0; idx < groups.length; idx++) {{
      const group = groups[idx]!;
      const raw = await fetchPage(group);
      const items = asList(raw);
      yield {{
        page: idx,
        offset: idx,
        limit: 1,
        key: group,
        items,
        raw,
        done: idx === groups.length - 1,
      }};
    }}
    return;
  }}

  for (let i = 0; i < maxPages; i++) {{
    let page = start + i;
    let offset = (page - 1) * pageSize;
    let key = String(page);
    let raw: unknown;
    if (style === "arcgis") {{
      offset = (start > 0 ? start : 0) + i * pageSize;
      page = i;
      key = String(offset);
      raw = await fetchPage(offset, pageSize);
    }} else if (style === "pagerequest") {{
      const index = (start >= 0 ? start : 0) + i;
      page = index;
      offset = index * pageSize;
      key = String(index);
      raw = await fetchPage(index, pageSize);
    }} else {{
      raw = await fetchPage(page, pageSize);
    }}
    const items = asList(raw);
    const empty = items.length === 0;
    yield {{ page, offset, limit: pageSize, key, items, raw, done: empty }};
    if (empty) break;
    if ((style === "arcgis" || style === "pagerequest") && items.length < pageSize) break;
  }}
}}

export async function* iterLabEndpoint(
  client: Record<string, FetchPage>,
  endpointId: string,
  options: {{ start?: number; maxPages?: number; pageSize?: number }} = {{}},
): AsyncGenerator<PageResult> {{
  const meta = LAB_ENDPOINTS.find((m) => m.id === endpointId);
  if (!meta) throw new Error(`No lab endpoint ${{endpointId}} for {slug}`);
  const fn = client[meta.method];
  if (!fn) throw new Error(`Client missing method ${{meta.method}}`);
  const style = meta.style;
  const fetchPage: FetchPage = async (...args: any[]) => {{
    if (style.toLowerCase() === "group_id") return fn(args[0] ?? "A");
    if (["client_slice", "full_download", "client_array", "html_list", "multi_host", "time_window"].includes(style.toLowerCase())) {{
      return fn();
    }}
    if (args.length >= 2) return fn(args[0], args[1]);
    return fn();
  }};
  yield* iterPages(fetchPage, {{ style, ...options }});
}}
'''


def _ts_method(endpoint_id: str) -> str:
    parts = re.split(r"[^a-zA-Z0-9]+", endpoint_id)
    parts = [p for p in parts if p]
    if not parts:
        return "endpoint"
    head, *tail = parts
    return head[0].lower() + head[1:] + "".join(t[:1].upper() + t[1:] for t in tail)


def render_ts_shard() -> str:
    return '''/** Shard helpers for parallel probes / crawls. */

const CEB_GROUPS = "ABCDEFGHIJKLMNOPQRSTUVWXY".split("");

export function shardSlice<T>(items: T[], shardIndex: number, shardCount: number): T[] {
  if (shardCount < 1) throw new Error("shardCount must be >= 1");
  if (shardIndex < 0 || shardIndex >= shardCount) throw new Error("shardIndex out of range");
  return items.filter((_, i) => i % shardCount === shardIndex);
}

export function shardRange(
  start: number,
  end: number,
  shardIndex: number,
  shardCount: number,
): [number, number] {
  if (end < start) throw new Error("end must be >= start");
  if (shardCount < 1) throw new Error("shardCount must be >= 1");
  const total = end - start;
  const base = Math.floor(total / shardCount);
  const rem = total % shardCount;
  const lo = start + shardIndex * base + Math.min(shardIndex, rem);
  const hi = lo + base + (shardIndex < rem ? 1 : 0);
  return [lo, hi];
}

export function shardPageNumbers(
  startPage: number,
  endPage: number,
  shardIndex: number,
  shardCount: number,
): number[] {
  const [lo, hi] = shardRange(startPage, endPage + 1, shardIndex, shardCount);
  return Array.from({ length: hi - lo }, (_, i) => lo + i);
}

export function shardOffsets(
  totalRecords: number,
  pageSize: number,
  shardIndex: number,
  shardCount: number,
): number[] {
  if (pageSize < 1) throw new Error("pageSize must be >= 1");
  const offsets: number[] = [];
  for (let o = 0; o < Math.max(totalRecords, 0); o += pageSize) offsets.push(o);
  return shardSlice(offsets, shardIndex, shardCount);
}

export function shardGroups(
  shardIndex: number,
  shardCount: number,
  groups: string[] = CEB_GROUPS,
): string[] {
  return shardSlice(groups, shardIndex, shardCount);
}

export function planShards(shardCount: number): Array<{ index: number; count: number }> {
  return Array.from({ length: shardCount }, (_, index) => ({ index, count: shardCount }));
}
'''


def render_js_models(domain_ids: list[str]) -> str:
    # JSDoc typedefs
    lines = [
        "/** @typedef {{ page: number, offset?: number, limit?: number, key?: string, items: any[], raw?: any, done?: boolean }} PageResult */",
        "",
    ]
    for domain_id in domain_ids:
        model = DOMAIN_MODEL_NAMES.get(domain_id, "Model")
        fields = DOMAIN_FIELD_TYPES.get(domain_id, {})
        props = ", ".join(f"{k}: ?{ts_type(v)}" for k, v in fields.items())
        lines.append(f"/** @typedef {{{{ {props} }}}} {model} */")
    lines += [
        "",
        "export {};",
        "",
    ]
    return "\n".join(lines)


def render_js_pagination(slug: str, labs: list[dict]) -> str:
    # Strip types from TS version roughly by writing JS directly
    methods_meta = [
        {
            "id": ep["id"],
            "method": _ts_method(ep["id"]),
            "style": (ep.get("pagination") or {}).get("style") or "page_limit",
        }
        for ep in labs
    ]
    return f'''/** Pagination iterators for lab endpoints (ESM). */

export const LAB_ENDPOINTS = {json.dumps(methods_meta, indent=2)};

const CEB_GROUPS = "ABCDEFGHIJKLMNOPQRSTUVWXY".split("");

function asList(raw) {{
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object") {{
    for (const key of ["data", "items", "results", "content", "features", "clusters", "reqTradeSummaryList", "offers", "records", "rows"]) {{
      if (Array.isArray(raw[key])) return raw[key];
    }}
    return [raw];
  }}
  return [raw];
}}

export async function* iterPages(fetchPage, options = {{}}) {{
  const style = (options.style || "page_limit").toLowerCase();
  const start = options.start ?? 1;
  const maxPages = options.maxPages ?? 50;
  const pageSize = options.pageSize ?? 50;

  if (["client_slice", "full_download", "client_array", "html_list", "multi_host", "time_window"].includes(style)) {{
    const raw = await fetchPage();
    const items = asList(raw);
    if (items.length === 0) {{
      yield {{ page: 0, offset: 0, limit: pageSize, items: [], raw, done: true }};
      return;
    }}
    for (let i = 0; i < items.length; i += pageSize) {{
      const chunk = items.slice(i, i + pageSize);
      const page = Math.floor(i / pageSize);
      yield {{ page, offset: i, limit: pageSize, items: chunk, raw: page === 0 ? raw : chunk, done: i + pageSize >= items.length }};
    }}
    return;
  }}

  if (style === "group_id") {{
    const groups = CEB_GROUPS.slice(0, maxPages);
    for (let idx = 0; idx < groups.length; idx++) {{
      const group = groups[idx];
      const raw = await fetchPage(group);
      const items = asList(raw);
      yield {{ page: idx, offset: idx, limit: 1, key: group, items, raw, done: idx === groups.length - 1 }};
    }}
    return;
  }}

  for (let i = 0; i < maxPages; i++) {{
    let page = start + i;
    let offset = (page - 1) * pageSize;
    let key = String(page);
    let raw;
    if (style === "arcgis") {{
      offset = (start > 0 ? start : 0) + i * pageSize;
      page = i;
      key = String(offset);
      raw = await fetchPage(offset, pageSize);
    }} else if (style === "pagerequest") {{
      const index = (start >= 0 ? start : 0) + i;
      page = index;
      offset = index * pageSize;
      key = String(index);
      raw = await fetchPage(index, pageSize);
    }} else {{
      raw = await fetchPage(page, pageSize);
    }}
    const items = asList(raw);
    const empty = items.length === 0;
    yield {{ page, offset, limit: pageSize, key, items, raw, done: empty }};
    if (empty) break;
    if ((style === "arcgis" || style === "pagerequest") && items.length < pageSize) break;
  }}
}}

export async function* iterLabEndpoint(client, endpointId, options = {{}}) {{
  const meta = LAB_ENDPOINTS.find((m) => m.id === endpointId);
  if (!meta) throw new Error(`No lab endpoint ${{endpointId}} for {slug}`);
  const fn = client[meta.method].bind(client);
  const style = meta.style;
  const fetchPage = async (...args) => {{
    if (style.toLowerCase() === "group_id") return fn(args[0] ?? "A");
    if (["client_slice", "full_download", "client_array", "html_list", "multi_host", "time_window"].includes(style.toLowerCase())) {{
      return fn();
    }}
    if (args.length >= 2) return fn(args[0], args[1]);
    return fn();
  }};
  yield* iterPages(fetchPage, {{ style, ...options }});
}}
'''


def render_js_shard() -> str:
    return '''/** Shard helpers for parallel probes / crawls (ESM). */

const CEB_GROUPS = "ABCDEFGHIJKLMNOPQRSTUVWXY".split("");

export function shardSlice(items, shardIndex, shardCount) {
  if (shardCount < 1) throw new Error("shardCount must be >= 1");
  if (shardIndex < 0 || shardIndex >= shardCount) throw new Error("shardIndex out of range");
  return items.filter((_, i) => i % shardCount === shardIndex);
}

export function shardRange(start, end, shardIndex, shardCount) {
  if (end < start) throw new Error("end must be >= start");
  if (shardCount < 1) throw new Error("shardCount must be >= 1");
  const total = end - start;
  const base = Math.floor(total / shardCount);
  const rem = total % shardCount;
  const lo = start + shardIndex * base + Math.min(shardIndex, rem);
  const hi = lo + base + (shardIndex < rem ? 1 : 0);
  return [lo, hi];
}

export function shardPageNumbers(startPage, endPage, shardIndex, shardCount) {
  const [lo, hi] = shardRange(startPage, endPage + 1, shardIndex, shardCount);
  return Array.from({ length: hi - lo }, (_, i) => lo + i);
}

export function shardOffsets(totalRecords, pageSize, shardIndex, shardCount) {
  if (pageSize < 1) throw new Error("pageSize must be >= 1");
  const offsets = [];
  for (let o = 0; o < Math.max(totalRecords, 0); o += pageSize) offsets.push(o);
  return shardSlice(offsets, shardIndex, shardCount);
}

export function shardGroups(shardIndex, shardCount, groups = CEB_GROUPS) {
  return shardSlice(groups, shardIndex, shardCount);
}

export function planShards(shardCount) {
  return Array.from({ length: shardCount }, (_, index) => ({ index, count: shardCount }));
}
'''


def patch_py_init_exports(init_path: Path, mod: str, domain_ids: list[str], labs: list[dict]) -> None:
    text = init_path.read_text()
    model_names = ["PageResult"] + [
        DOMAIN_MODEL_NAMES[d] for d in domain_ids if d in DOMAIN_MODEL_NAMES
    ]
    # path: api-docs/packages/<slug>/python/<mod>/__init__.py
    slug = init_path.parents[2].name
    cls = class_name(slug)

    if "# --- extras: models" in text:
        text = re.split(r"\n# --- extras: models", text)[0].rstrip() + "\n"

    extras = [
        "",
        "# --- extras: models / pagination / shard ---",
        f"from .models import {', '.join(model_names)}",
        "from .pagination import LAB_ENDPOINTS, iter_lab_endpoint, iter_pages",
        "from .shard import (",
        "    plan_shards,",
        "    shard_groups,",
        "    shard_offsets,",
        "    shard_page_numbers,",
        "    shard_range,",
        "    shard_slice,",
        ")",
        "",
        "__all__ = [",
        f'    "{cls}",',
        *[f'    "{n}",' for n in model_names],
        '    "LAB_ENDPOINTS",',
        '    "iter_lab_endpoint",',
        '    "iter_pages",',
        '    "plan_shards",',
        '    "shard_groups",',
        '    "shard_offsets",',
        '    "shard_page_numbers",',
        '    "shard_range",',
        '    "shard_slice",',
        "]",
        "",
    ]
    text = re.sub(r"\n__all__\s*=\s*\[[^\]]*\]\s*", "\n", text)
    init_path.write_text(text.rstrip() + "\n" + "\n".join(extras))


def patch_ts_index(index_path: Path, domain_ids: list[str]) -> None:
    text = index_path.read_text()
    cls_match = re.search(r"export \{ (\w+)", text)
    cls = cls_match.group(1) if cls_match else "Client"
    model_exports = ", ".join(
        ["PageResult"] + [DOMAIN_MODEL_NAMES[d] for d in domain_ids if d in DOMAIN_MODEL_NAMES]
    )
    index_path.write_text(
        f'''export {{ {cls}, default }} from "./client.js";
export type {{ ClientOptions, RequestOptions, QueryValue }} from "./client.js";
export {{ ENDPOINTS, type EndpointSpec }} from "./catalog.js";
export type {{ {model_exports} }} from "./models.js";
export {{ LAB_ENDPOINTS, iterPages, iterLabEndpoint }} from "./pagination.js";
export {{
  shardSlice,
  shardRange,
  shardPageNumbers,
  shardOffsets,
  shardGroups,
  planShards,
}} from "./shard.js";
'''
    )


def write_examples(pkg_dir: Path, slug: str, labs: list[dict], domain_ids: list[str]) -> None:
    mod = module_name(slug)
    cls = class_name(slug)
    lab_id = labs[0]["id"] if labs else None
    model = DOMAIN_MODEL_NAMES[domain_ids[0]] if domain_ids else "PageResult"

    py_ex = pkg_dir / "python" / "examples"
    py_ex.mkdir(parents=True, exist_ok=True)
    if lab_id:
        method = camel_method(lab_id)
        py_ex.joinpath("pagination_shard_demo.py").write_text(
            f'''"""Demo: pagination iterator + shard helper."""
from {mod} import (
    {cls},
    {model},
    iter_lab_endpoint,
    shard_groups,
    shard_page_numbers,
)

# Shard 0 of 4 owns these CEB groups / pages
print("groups", shard_groups(0, 4))
print("pages", shard_page_numbers(1, 20, 0, 4))

# Live iteration (polite) — may fail offline
# with {cls}() as client:
#     for page in iter_lab_endpoint(client, {lab_id!r}, max_pages=2, page_size=20):
#         print(page.page, len(page.items), page.done)
'''
        )
    else:
        py_ex.joinpath("pagination_shard_demo.py").write_text(
            f'''"""Demo: shard helper (no lab endpoints on this package)."""
from {mod} import shard_page_numbers, shard_groups, {model}

print("pages", shard_page_numbers(1, 10, 0, 2))
print("groups", shard_groups(1, 2))
print("model", {model}())
'''
        )

    # docs
    docs = pkg_dir / "docs"
    docs.mkdir(exist_ok=True)
    docs.joinpath("CLIENT_EXTRAS.md").write_text(
        f"""# Client extras — `{slug}`

## Typed models

Canonical dataclass / TS types from field-coverage domains: {', '.join(f'`{d}`' for d in domain_ids) or '_(generic PageResult only)_'}.

- Python: `python/{mod}/models.py`
- TypeScript: `typescript/src/models.ts`
- JavaScript: `javascript/models.mjs` (JSDoc typedefs)

## Pagination iterator

Lab endpoints: {', '.join(f'`{e["id"]}`' for e in labs) or '_(none — client_slice helpers still available)_'}.

```python
from {mod} import {cls}, iter_lab_endpoint

with {cls}() as client:
    for page in iter_lab_endpoint(client, {lab_id!r}, max_pages=3, page_size=50):
        print(page.page, len(page.items), page.done)
```

```ts
import {{ {cls}, iterLabEndpoint }} from "./src/index.js";
const client = new {cls}();
for await (const page of iterLabEndpoint(client as any, {lab_id!r}, {{ maxPages: 3 }})) {{
  console.log(page.page, page.items.length, page.done);
}}
```

## Shard helper

```python
from {mod} import shard_groups, shard_page_numbers, shard_offsets

shard_groups(0, 4)           # CEB A–Y split
shard_page_numbers(1, 40, 1, 4)
shard_offsets(1000, 50, 2, 4)
```
"""
    )


def scaffold_one(pkg_dir: Path, coverage: dict) -> dict:
    slug = pkg_dir.name
    catalog = yaml.safe_load((pkg_dir / "catalog" / "endpoints.yaml").read_text())
    domain_ids = domains_for_slug(coverage, slug)
    labs = lab_endpoints(catalog)
    mod = module_name(slug)

    # Python
    py_mod = pkg_dir / "python" / mod
    if py_mod.is_dir():
        (py_mod / "models.py").write_text(render_py_models(slug, domain_ids))
        (py_mod / "pagination.py").write_text(render_py_pagination(slug, labs))
        (py_mod / "shard.py").write_text(render_py_shard())
        patch_py_init_exports(py_mod / "__init__.py", mod, domain_ids, labs)

    # TypeScript
    ts_src = pkg_dir / "typescript" / "src"
    if ts_src.is_dir():
        (ts_src / "models.ts").write_text(render_ts_models(domain_ids))
        (ts_src / "pagination.ts").write_text(render_ts_pagination(slug, labs))
        (ts_src / "shard.ts").write_text(render_ts_shard())
        patch_ts_index(ts_src / "index.ts", domain_ids)

    # JavaScript
    js_root = pkg_dir / "javascript"
    if js_root.is_dir():
        (js_root / "models.mjs").write_text(render_js_models(domain_ids))
        (js_root / "pagination.mjs").write_text(render_js_pagination(slug, labs))
        (js_root / "shard.mjs").write_text(render_js_shard())
        # barrel
        (js_root / "index.mjs").write_text(
            """export { default } from "./client.mjs";
export * from "./client.mjs";
export * from "./pagination.mjs";
export * from "./shard.mjs";
"""
        )

    write_examples(pkg_dir, slug, labs, domain_ids)

    return {
        "slug": slug,
        "domains": domain_ids,
        "labEndpoints": [e["id"] for e in labs],
        "models": [DOMAIN_MODEL_NAMES[d] for d in domain_ids if d in DOMAIN_MODEL_NAMES],
        "hasPaginationLab": bool(labs),
    }


def main() -> None:
    coverage = load_coverage()
    rows = []
    for pkg_dir in sorted(ROOT.iterdir()):
        if not pkg_dir.is_dir():
            continue
        if not (pkg_dir / "catalog" / "endpoints.yaml").exists():
            continue
        info = scaffold_one(pkg_dir, coverage)
        rows.append(info)
        print(
            "extras",
            info["slug"],
            f"models={len(info['models'])}",
            f"labs={len(info['labEndpoints'])}",
        )

    lines = [
        "# Client extras — typed models, pagination iterator, shard helper",
        "",
        "Added to **every** package for Python, TypeScript, and JavaScript.",
        "",
        "Regenerate: `python3 scripts/scaffold-client-extras.py`",
        "",
        "| Package | Models | Lab endpoints |",
        "|---|---|---|",
    ]
    for r in rows:
        lines.append(
            f"| `{r['slug']}` | {', '.join(f'`{m}`' for m in r['models']) or '—'} | "
            f"{', '.join(f'`{x}`' for x in r['labEndpoints']) or '—'} |"
        )
    lines += [
        "",
        "## Modules",
        "",
        "| Stack | Models | Pagination | Shard |",
        "|---|---|---|---|",
        "| Python | `python/<mod>/models.py` | `pagination.py` | `shard.py` |",
        "| TypeScript | `typescript/src/models.ts` | `pagination.ts` | `shard.ts` |",
        "| JavaScript | `javascript/models.mjs` | `pagination.mjs` | `shard.mjs` |",
        "",
        "## APIs",
        "",
        "- **Typed models** — dataclasses / TS types from field-coverage domains + `PageResult`",
        "- **Pagination iterator** — `iter_pages` / `iter_lab_endpoint` (page_limit, page_number, arcgis, group_id, pageRequest, client_slice, …)",
        "- **Shard helper** — `shard_groups`, `shard_page_numbers`, `shard_offsets`, `shard_range`, `shard_slice`, `plan_shards`",
        "",
    ]
    INDEX_OUT.write_text("\n".join(lines))
    JSON_OUT.write_text(json.dumps({"version": 1, "packages": rows}, indent=2) + "\n")
    print("wrote", INDEX_OUT, "packages=", len(rows))


if __name__ == "__main__":
    main()
