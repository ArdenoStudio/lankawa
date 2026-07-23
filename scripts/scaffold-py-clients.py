#!/usr/bin/env python3
"""Polish unofficial Python packages under api-docs/packages/*/python/."""
from __future__ import annotations

import json
import re
from pathlib import Path

import yaml

ROOT = Path("api-docs/packages")
INDEX_OUT = Path("api-docs/PYTHON_CLIENTS.md")
JSON_OUT = Path("src/lib/api-docs-py-clients.json")


def module_name(slug: str) -> str:
    name = re.sub(r"[^a-zA-Z0-9]+", "_", slug).strip("_").lower()
    if name and name[0].isdigit():
        name = "pkg_" + name
    return name


def class_name(slug: str) -> str:
    parts = re.split(r"[^a-zA-Z0-9]+", slug)
    return "".join(p[:1].upper() + p[1:] for p in parts if p) + "Client"


def pip_name(slug: str) -> str:
    return f"{slug}-unofficial"


def camel_method(s: str) -> str:
    """Python methods stay snake_case from catalog ids."""
    name = re.sub(r"[^a-zA-Z0-9]+", "_", s).strip("_").lower()
    if not name:
        return "endpoint"
    if name[0].isdigit():
        name = "e_" + name
    return name


def ua(slug: str) -> str:
    return (
        f"{slug}-unofficial/0.1 "
        f"(+https://github.com/Cookie-Cat21/{slug}; educational; polite)"
    )


def py_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def render_init(slug: str, meta: dict, endpoints: list[dict]) -> str:
    cls = class_name(slug)
    mod = module_name(slug)
    host = meta.get("host") or ""
    title = meta.get("title") or slug
    default_base = host if str(host).startswith("http") else ""
    methods: list[str] = []

    for ep in endpoints:
        eid = ep["id"]
        name = camel_method(eid)
        method = (ep.get("method") or "GET").upper()
        url = ep.get("url") or ""
        summary = (ep.get("summary") or "").replace('"""', "'''")
        status = ep.get("status") or "live"
        body = ep.get("body_json")
        pagination = ep.get("pagination")
        parked = status == "parked" or "parked" in eid

        if parked:
            methods.append(
                f'''    def {name}(self, **kwargs: Any) -> None:
        """{summary}

        PARKED — refuses live calls.
        """
        raise RuntimeError({py_str(f"Parked endpoint: {eid} ({slug})")})
'''
            )
            continue

        # Build signature + URL assembly
        sig_parts: list[str] = ["self"]
        url_lines: list[str] = [f"        url = {py_str(url)}"]
        body_lines: list[str] = ["        payload: Any = None"]

        if isinstance(pagination, dict) and pagination.get("lab"):
            style = (pagination.get("style") or "").lower()
            if "page_number" in style:
                sig_parts += ["page_number: int = 1", "size: int = 20"]
                url_lines = [
                    f"        url = self._with_query({py_str(url)}, "
                    f"{{'page_number': page_number, 'size': size}})"
                ]
            elif "page_limit" in style or "limit_page" in style:
                sig_parts += ["page: int = 1", "limit: int = 50"]
                url_lines = [
                    f"        url = self._with_query({py_str(url)}, "
                    f"{{'page': page, 'limit': limit}})"
                ]
            elif "arcgis" in style:
                sig_parts += ["result_offset: int = 0", "result_record_count: int = 50"]
                url_lines = [
                    f"        url = self._with_query({py_str(url)}, "
                    f"{{'resultOffset': result_offset, 'resultRecordCount': result_record_count}})"
                ]
            elif "group" in style:
                sig_parts += ['group_id: str = "A"']
                url_lines = [
                    f"        url = self._with_query({py_str(url)}, "
                    f"{{'LoadShedGroupId': group_id}})"
                ]
            elif "pagerequest" in style:
                sig_parts += ["index: int = 0", "limit: int = 20"]
                if body is not None:
                    body_lines = [
                        f"        payload = dict({py_str(body)})",
                        '        payload["pageRequest"] = {"index": index, "limit": limit}',
                    ]
                else:
                    body_lines = [
                        '        payload = {"pageRequest": {"index": index, "limit": limit}}'
                    ]

        if body is not None and not any("pageRequest" in ln for ln in body_lines):
            sig_parts.append("body: Any | None = None")
            body_lines = [
                f"        payload = {py_str(body)} if body is None else body",
            ]
        elif method != "GET" and body is None and not any("pageRequest" in ln for ln in body_lines):
            # POST with empty/default body from catalog
            if ep.get("body_json") == {} or "body_json" in ep:
                body_lines = ["        payload = {}"]

        # For CSE-style POST with body_json: {}
        if method != "GET" and body == {} and "payload =" not in "\n".join(body_lines):
            body_lines = ["        payload = {}"]

        sig_parts.append("**kwargs: Any")
        sig = ", ".join(sig_parts)

        if method == "GET":
            call = "        return self._request_json(url, method='GET', **kwargs)"
        else:
            call = (
                "        return self._request_json(url, method="
                + py_str(method)
                + ", json_body=payload, **kwargs)"
            )

        methods.append(
            f'''    def {name}({sig}) -> Any:
        """{summary}

        Catalog id: `{eid}` · {method}
        """
{chr(10).join(url_lines)}
{chr(10).join(body_lines)}
{call}
'''
        )

    methods_block = "\n".join(methods) if methods else "    # no endpoints\n"

    return f'''"""Minimal unofficial HTTP client for {title}.

Not affiliated with the upstream operator. Public reads only. Polite delays.
Generated from catalog/endpoints.yaml — regenerate via scripts/scaffold-py-clients.py
"""

from __future__ import annotations

import json
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse
from urllib.request import Request, urlopen

DEFAULT_UA = {py_str(ua(slug))}
DEFAULT_BASE = {py_str(default_base)}


class {cls}:
    """Unofficial client — {title}."""

    slug = {py_str(slug)}
    title = {py_str(title)}

    def __init__(
        self,
        *,
        base_url: str = DEFAULT_BASE,
        timeout: float = 30.0,
        default_delay_seconds: float = 1.0,
        user_agent: str = DEFAULT_UA,
        headers: dict[str, str] | None = None,
    ) -> None:
        self.base_url = (base_url or "").rstrip("/")
        self.timeout = timeout
        self.default_delay_seconds = default_delay_seconds
        self.user_agent = user_agent
        self._headers = {{
            "Accept": "application/json, text/plain, */*",
            "User-Agent": user_agent,
            **(headers or {{}}),
        }}

    def close(self) -> None:
        """No persistent connection — kept for cse-api-docs API symmetry."""

    def __enter__(self) -> "{cls}":
        return self

    def __exit__(self, *args: object) -> None:
        self.close()

    def _with_query(self, url: str, params: dict[str, Any]) -> str:
        parsed = urlparse(url)
        q = dict(parse_qsl(parsed.query, keep_blank_values=True))
        for k, v in params.items():
            if v is None:
                continue
            q[str(k)] = str(v)
        return urlunparse(parsed._replace(query=urlencode(q)))

    def _resolve(self, url: str) -> str:
        if url.startswith("http://") or url.startswith("https://"):
            return url
        if not self.base_url:
            return url
        if not url.startswith("/"):
            url = "/" + url
        return self.base_url + url

    def _request_json(
        self,
        url: str,
        *,
        method: str = "GET",
        json_body: Any = None,
        delay_seconds: float | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        delay = self.default_delay_seconds if delay_seconds is None else delay_seconds
        if delay and delay > 0:
            time.sleep(delay)
        full = self._resolve(url)
        h = {{**self._headers, **(headers or {{}})}}
        data = None
        if json_body is not None and method.upper() not in {{"GET", "HEAD"}}:
            data = json.dumps(json_body).encode("utf-8")
            h.setdefault("Content-Type", "application/json")
        req = Request(full, data=data, headers=h, method=method.upper())
        try:
            with urlopen(req, timeout=self.timeout) as res:  # noqa: S310
                raw = res.read().decode("utf-8", "replace")
                status = getattr(res, "status", 200)
        except HTTPError as e:
            body = e.read().decode("utf-8", "replace")[:280]
            raise RuntimeError(f"{{method}} {{full}} -> {{e.code}}: {{body}}") from e
        except URLError as e:
            raise RuntimeError(f"{{method}} {{full}} failed: {{e}}") from e
        if not raw:
            return None
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return raw

{methods_block}

__all__ = ["{cls}"]
'''


def render_setup(slug: str, title: str) -> str:
    mod = module_name(slug)
    pip = pip_name(slug)
    return f'''from setuptools import setup

setup(
    name={py_str(pip)},
    version="0.1.0",
    description={py_str(f"Minimal unofficial HTTP helpers for {title} (educational)")},
    url={py_str(f"https://github.com/Cookie-Cat21/{slug}")},
    packages=[{py_str(mod)}],
    package_dir={{{py_str(mod)}: {py_str(mod)}}},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)
'''


def render_pyproject(slug: str, title: str) -> str:
    mod = module_name(slug)
    pip = pip_name(slug)
    return f'''[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[project]
name = {py_str(pip)}
version = "0.1.0"
description = {py_str(f"Minimal unofficial HTTP helpers for {title} (educational)")}
readme = "README.md"
requires-python = ">=3.11"
license = {{ text = "MIT" }}
dependencies = []

[project.urls]
Homepage = {py_str(f"https://github.com/Cookie-Cat21/{slug}")}

[tool.setuptools]
packages = [{py_str(mod)}]
'''


def render_readme(slug: str, title: str, endpoints: list[dict]) -> str:
    cls = class_name(slug)
    mod = module_name(slug)
    pip = pip_name(slug)
    first = camel_method(endpoints[0]["id"]) if endpoints else "ping"
    lines = [
        f"# Python helper — {title}",
        "",
        "> Unofficial · not affiliated · polite public reads only.",
        "",
        f"Installable package `{pip}` (module `{mod}`), matching the Cookie-Cat21/cse-api-docs `python/` layout.",
        "",
        "## Install",
        "",
        "```bash",
        "cd python",
        "python3 -m venv .venv && source .venv/bin/activate",
        "pip install -e .",
        "python smoke.py",
        "```",
        "",
        "## Usage",
        "",
        "```python",
        f"from {mod} import {cls}",
        "",
        f"with {cls}(default_delay_seconds=1.0) as client:",
        f"    data = client.{first}()",
        "    print(data)",
        "```",
        "",
        "## Methods",
        "",
    ]
    for ep in endpoints:
        mid = camel_method(ep["id"])
        lines.append(
            f"- `{mid}()` — {(ep.get('method') or 'GET')} `{ep.get('path') or ep.get('url')}` — {ep.get('summary', '')}"
        )
    lines += [
        "",
        "## Ethics",
        "",
        "See `../docs/ETHICS.md`. Default ≥1s delay. No credentials / captcha bypass. stdlib `urllib` only (no httpx required).",
        "",
        "## Regenerate",
        "",
        "```bash",
        "python3 scripts/scaffold-py-clients.py",
        "```",
        "",
    ]
    return "\n".join(lines)


def render_smoke(slug: str, endpoints: list[dict]) -> str:
    cls = class_name(slug)
    mod = module_name(slug)
    pick = next(
        (
            ep
            for ep in endpoints
            if ep.get("status") != "parked" and "parked" not in ep.get("id", "")
        ),
        None,
    )
    if not pick:
        return f'''"""Quick client smoke — no live endpoints."""

from {mod} import {cls}

with {cls}(default_delay_seconds=0) as client:
    print("slug", client.slug, "no live endpoints to smoke")
'''
    name = camel_method(pick["id"])
    return f'''"""Quick client smoke — polite delay on."""

from {mod} import {cls}

with {cls}(default_delay_seconds=1.0) as client:
    print("smoke", client.slug, "->", {py_str(name)})
    data = client.{name}()
    preview = data if isinstance(data, str) else json_preview(data)
    print("ok", preview)


def json_preview(data, limit: int = 200) -> str:
    import json

    try:
        return json.dumps(data, ensure_ascii=False)[:limit]
    except TypeError:
        return str(data)[:limit]
'''


def scaffold_one(pkg_dir: Path) -> dict:
    slug = pkg_dir.name
    catalog = yaml.safe_load((pkg_dir / "catalog" / "endpoints.yaml").read_text())
    package_yaml = pkg_dir / "PACKAGE.yaml"
    meta = yaml.safe_load(package_yaml.read_text()) if package_yaml.exists() else {}
    meta.setdefault("title", catalog.get("title", slug))
    meta.setdefault("host", catalog.get("host", ""))
    endpoints = catalog.get("endpoints") or []

    py_root = pkg_dir / "python"
    mod = module_name(slug)
    cls = class_name(slug)
    mod_dir = py_root / mod
    mod_dir.mkdir(parents=True, exist_ok=True)

    (mod_dir / "__init__.py").write_text(render_init(slug, meta, endpoints))
    (py_root / "setup.py").write_text(render_setup(slug, meta["title"]))
    (py_root / "pyproject.toml").write_text(render_pyproject(slug, meta["title"]))
    (py_root / "README.md").write_text(render_readme(slug, meta["title"], endpoints))
    (py_root / ".gitignore").write_text(".venv/\n__pycache__/\n*.egg-info/\ndist/\nbuild/\n")

    pick = next(
        (
            ep
            for ep in endpoints
            if ep.get("status") != "parked" and "parked" not in ep.get("id", "")
        ),
        None,
    )
    if pick is None:
        (py_root / "smoke.py").write_text(
            f'''"""Quick client smoke — no live endpoints."""

from {mod} import {cls}

with {cls}(default_delay_seconds=0) as client:
    print("slug", client.slug, "no live endpoints to smoke")
'''
        )
    else:
        name = camel_method(pick["id"])
        (py_root / "smoke.py").write_text(
            f'''"""Quick client smoke — polite delay on."""

from __future__ import annotations

import json

from {mod} import {cls}


def json_preview(data: object, limit: int = 200) -> str:
    try:
        return json.dumps(data, ensure_ascii=False)[:limit]
    except TypeError:
        return str(data)[:limit]


with {cls}(default_delay_seconds=1.0) as client:
    print("smoke", client.slug, "->", {py_str(name)})
    data = client.{name}()
    preview = data[:200] if isinstance(data, str) else json_preview(data)
    print("ok", preview)
'''
        )

    return {
        "slug": slug,
        "pip": pip_name(slug),
        "module": mod,
        "className": cls,
        "endpointCount": len(endpoints),
        "methodCount": len(endpoints),
        "path": f"api-docs/packages/{slug}/python",
    }


def main() -> None:
    rows = []
    for pkg_dir in sorted(ROOT.iterdir()):
        if not pkg_dir.is_dir():
            continue
        if not (pkg_dir / "catalog" / "endpoints.yaml").exists():
            continue
        info = scaffold_one(pkg_dir)
        rows.append(info)
        print("polished", info["slug"], info["pip"], f"methods={info['methodCount']}")

    lines = [
        "# Python clients — all packages",
        "",
        "Each staging package has an installable unofficial helper under `python/`,",
        "matching [cse-api-docs/python](https://github.com/Cookie-Cat21/cse-api-docs/tree/main/python).",
        "",
        "Regenerate: `python3 scripts/scaffold-py-clients.py`",
        "",
        "| Package | pip name | Module | Class | Methods | Path |",
        "|---|---|---|---|---|---|",
    ]
    for r in rows:
        lines.append(
            f"| `{r['slug']}` | `{r['pip']}` | `{r['module']}` | `{r['className']}` | {r['methodCount']} | `{r['path']}` |"
        )
    lines += [
        "",
        "## Quick start",
        "",
        "```bash",
        "cd api-docs/packages/combank-api-docs/python",
        "python3 -m venv .venv && source .venv/bin/activate",
        "pip install -e .",
        "python -c 'from combank_api_docs import CombankApiDocsClient; print(CombankApiDocsClient.slug)'",
        "# python smoke.py   # live network",
        "```",
        "",
        "## Notes",
        "",
        "- Python ≥3.11, **stdlib only** (`urllib`) — no httpx required",
        "- Default delay 1.0s between calls",
        "- Context-manager API (`with Client() as c:`) like cse-api-docs",
        "- Parked endpoints raise `RuntimeError`",
        "- Pagination-lab endpoints accept page/limit/offset/group helpers",
        "",
    ]
    INDEX_OUT.write_text("\n".join(lines))
    JSON_OUT.write_text(json.dumps({"version": 1, "clients": rows}, indent=2) + "\n")
    print("wrote", INDEX_OUT, "packages=", len(rows))


if __name__ == "__main__":
    main()
