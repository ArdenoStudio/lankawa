#!/usr/bin/env python3
"""Scaffold unofficial TS + plain JS clients under api-docs/packages/*/."""
from __future__ import annotations

import json
import re
from pathlib import Path

import yaml

ROOT = Path("api-docs/packages")
INDEX_OUT = Path("api-docs/TYPESCRIPT_CLIENTS.md")
JSON_OUT = Path("src/lib/api-docs-ts-clients.json")


def camel(s: str) -> str:
    parts = re.split(r"[^a-zA-Z0-9]+", s)
    parts = [p for p in parts if p]
    if not parts:
        return "endpoint"
    head, *tail = parts
    return head[0].lower() + head[1:] + "".join(t[:1].upper() + t[1:] for t in tail)


def safe_ident(s: str) -> str:
    out = camel(s)
    if out[0].isdigit():
        out = "e" + out
    return out


def npm_name(slug: str) -> str:
    return f"@cookie-cat21/{slug}-client"


def class_name(slug: str) -> str:
    # combank-api-docs -> CombankApiDocsClient
    parts = re.split(r"[^a-zA-Z0-9]+", slug)
    return "".join(p[:1].upper() + p[1:] for p in parts if p) + "Client"


def ua(slug: str) -> str:
    return (
        f"{slug}-unofficial/0.1 "
        f"(+https://github.com/Cookie-Cat21/{slug}; educational; polite)"
    )


def ts_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def render_client(slug: str, meta: dict, endpoints: list[dict]) -> str:
    cls = class_name(slug)
    host = meta.get("host") or ""
    title = meta.get("title") or slug
    default_base = host if str(host).startswith("http") else ""
    methods = []
    for ep in endpoints:
        eid = ep["id"]
        name = safe_ident(eid)
        method = (ep.get("method") or "GET").upper()
        url = ep.get("url") or ""
        summary = (ep.get("summary") or "").replace("*/", "* /")
        status = ep.get("status") or "live"
        body = ep.get("body_json")
        pagination = ep.get("pagination")
        parked = status == "parked" or name.endswith("Parked") or "parked" in eid

        params_sig = "options: RequestOptions = {}"
        extra_args = ""
        url_expr = f"this.resolveUrl({ts_string(url)}, options.query)"
        body_expr = "options.body"

        if body is not None:
            extra_args = "body: unknown = undefined, "
            params_sig = f"{extra_args}options: RequestOptions = {{}}"
            default_body = json.dumps(body, ensure_ascii=False)
            body_expr = f"body !== undefined ? body : ({default_body} as unknown)"

        # pagination helpers: merge common query knobs
        if isinstance(pagination, dict) and pagination.get("lab"):
            style = (pagination.get("style") or "").lower()
            if "page_number" in style:
                extra_args = "pageNumber = 1, size = 20, "
                params_sig = f"{extra_args}options: RequestOptions = {{}}"
                url_expr = (
                    f"this.withQuery({ts_string(url)}, "
                    f"{{ page_number: pageNumber, size }}, options.query)"
                )
            elif "page_limit" in style or "limit_page" in style:
                extra_args = "page = 1, limit = 50, "
                params_sig = f"{extra_args}options: RequestOptions = {{}}"
                url_expr = (
                    f"this.withQuery({ts_string(url)}, "
                    f"{{ page, limit }}, options.query)"
                )
            elif "arcgis" in style:
                extra_args = "resultOffset = 0, resultRecordCount = 50, "
                params_sig = f"{extra_args}options: RequestOptions = {{}}"
                url_expr = (
                    f"this.withQuery({ts_string(url)}, "
                    f"{{ resultOffset, resultRecordCount }}, options.query)"
                )
            elif "group" in style:
                extra_args = 'groupId = "A", '
                params_sig = f"{extra_args}options: RequestOptions = {{}}"
                url_expr = (
                    f"this.withQuery({ts_string(url)}, "
                    f"{{ LoadShedGroupId: groupId }}, options.query)"
                )
            elif "pagerequest" in style:
                extra_args = "index = 0, limit = 20, "
                params_sig = f"{extra_args}options: RequestOptions = {{}}"
                # body merge for Visa-style
                if body is not None:
                    default_body = json.dumps(body, ensure_ascii=False)
                    body_expr = (
                        f"({{ ...({default_body} as Record<string, unknown>), "
                        f"pageRequest: {{ index, limit }} }})"
                    )
                else:
                    body_expr = "{ pageRequest: { index, limit } }"

        if parked:
            methods.append(
                f'''  /**
   * {summary}
   * @remarks PARKED — see docs; method refuses live calls by default.
   */
  async {name}({params_sig}): Promise<never> {{
    void options;
    throw new Error({ts_string(f"Parked endpoint: {eid} ({slug})")});
  }}'''
            )
            continue

        if method == "GET":
            call = f"return this.requestJson<unknown>({url_expr}, {{ ...options, method: \"GET\" }});"
        else:
            call = (
                f"return this.requestJson<unknown>({url_expr}, {{ ...options, method: {ts_string(method)}, body: {body_expr} }});"
            )

        methods.append(
            f'''  /**
   * {summary}
   * Catalog id: `{eid}` · {method}
   */
  async {name}({params_sig}): Promise<unknown> {{
    {call}
  }}'''
        )

    methods_block = "\n\n".join(methods) if methods else "  // no endpoints"

    return f'''/**
 * Unofficial TypeScript client — {title}
 *
 * Not affiliated with the upstream operator. Public reads only. Polite delays.
 * Generated from catalog/endpoints.yaml — regenerate via scripts/scaffold-ts-clients.py
 */

export type QueryValue = string | number | boolean | undefined | null;

export type RequestOptions = {{
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  body?: unknown;
  method?: string;
  /** Delay before the request (ms). Default 1000. */
  delayMs?: number;
  signal?: AbortSignal;
}};

export type ClientOptions = {{
  /** Override base host when catalog URLs are path-only. */
  baseUrl?: string;
  userAgent?: string;
  defaultDelayMs?: number;
  fetchImpl?: typeof fetch;
}};

const DEFAULT_UA = {ts_string(ua(slug))};

function sleep(ms: number): Promise<void> {{
  return new Promise((resolve) => setTimeout(resolve, ms));
}}

export class {cls} {{
  readonly baseUrl: string;
  readonly userAgent: string;
  readonly defaultDelayMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ClientOptions = {{}}) {{
    this.baseUrl = (options.baseUrl ?? {ts_string(default_base)}).replace(/\\/$/, "");
    this.userAgent = options.userAgent ?? DEFAULT_UA;
    this.defaultDelayMs = options.defaultDelayMs ?? 1000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }}

  /** Catalog metadata for this package. */
  static readonly slug = {ts_string(slug)};
  static readonly title = {ts_string(title)};

  withQuery(
    url: string,
    defaults: Record<string, QueryValue>,
    extra?: Record<string, QueryValue>,
  ): string {{
    const u = new URL(url, this.baseUrl || undefined);
    for (const [k, v] of Object.entries({{ ...defaults, ...(extra ?? {{}}) }})) {{
      if (v === undefined || v === null) continue;
      u.searchParams.set(k, String(v));
    }}
    return u.toString();
  }}

  resolveUrl(url: string, query?: Record<string, QueryValue>): string {{
    if (!query || Object.keys(query).length === 0) {{
      if (url.startsWith("http")) return url;
      return `${{this.baseUrl}}${{url.startsWith("/") ? url : `/${{url}}`}}`;
    }}
    return this.withQuery(url, {{}}, query);
  }}

  async requestJson<T = unknown>(url: string, options: RequestOptions = {{}}): Promise<T> {{
    const delay = options.delayMs ?? this.defaultDelayMs;
    if (delay > 0) await sleep(delay);
    const method = (options.method ?? "GET").toUpperCase();
    const headers: Record<string, string> = {{
      Accept: "application/json, text/plain, */*",
      "User-Agent": this.userAgent,
      ...(options.headers ?? {{}}),
    }};
    let body: string | undefined;
    if (options.body !== undefined && method !== "GET" && method !== "HEAD") {{
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
      body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    }}
    const res = await this.fetchImpl(url, {{
      method,
      headers,
      body,
      signal: options.signal,
    }});
    const text = await res.text();
    if (!res.ok) {{
      throw new Error(`${{method}} ${{url}} -> ${{res.status}}: ${{text.slice(0, 280)}}`);
    }}
    if (!text) return undefined as T;
    try {{
      return JSON.parse(text) as T;
    }} catch {{
      return text as T;
    }}
  }}

{methods_block}
}}

export default {cls};
'''


def render_index_ts(slug: str) -> str:
    cls = class_name(slug)
    return f'''export {{ {cls}, default }} from "./client.js";
export type {{ ClientOptions, RequestOptions, QueryValue }} from "./client.js";
export {{ ENDPOINTS, type EndpointSpec }} from "./catalog.js";
'''


def render_catalog_ts(endpoints: list[dict]) -> str:
    specs = []
    for ep in endpoints:
        specs.append(
            {
                "id": ep.get("id"),
                "method": ep.get("method", "GET"),
                "url": ep.get("url"),
                "path": ep.get("path"),
                "summary": ep.get("summary"),
                "status": ep.get("status", "live"),
                "pagination": ep.get("pagination"),
            }
        )
    body = json.dumps(specs, indent=2, ensure_ascii=False)
    return f'''export type EndpointSpec = {{
  id: string;
  method: string;
  url?: string;
  path?: string;
  summary?: string;
  status?: string;
  pagination?: unknown;
}};

/** Mirror of catalog/endpoints.yaml for runtime discovery. */
export const ENDPOINTS: EndpointSpec[] = {body} as EndpointSpec[];
'''


def render_package_json(slug: str, title: str) -> str:
    name = npm_name(slug)
    pkg = {
        "name": name,
        "version": "0.1.0",
        "description": f"Unofficial TypeScript client for {title}. Not affiliated with upstream.",
        "type": "module",
        "main": "./dist/index.js",
        "types": "./dist/index.d.ts",
        "exports": {
            ".": {
                "types": "./dist/index.d.ts",
                "import": "./dist/index.js",
            },
        },
        "files": ["dist", "src", "README.md"],
        "scripts": {
            "build": "tsc -p tsconfig.json",
            "smoke": "node --import tsx examples/smoke.ts",
            "typecheck": "tsc -p tsconfig.json --noEmit",
        },
        "engines": {"node": ">=18"},
        "license": "MIT",
        "keywords": ["sri-lanka", "unofficial-api", slug, "typescript"],
        "devDependencies": {
            "tsx": "^4.19.0",
            "typescript": "^5.6.0",
        },
    }
    return json.dumps(pkg, indent=2) + "\n"


def render_tsconfig() -> str:
    return """{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts"]
}
"""


def render_readme(slug: str, title: str, endpoints: list[dict]) -> str:
    cls = class_name(slug)
    name = npm_name(slug)
    first = safe_ident(endpoints[0]["id"]) if endpoints else "ping"
    lines = [
        f"# TypeScript client — {title}",
        "",
        "> Unofficial · not affiliated · polite public reads only.",
        "",
        f"Package: `{name}` · Staging path: `api-docs/packages/{slug}/typescript/`",
        "",
        "## Install (after extraction)",
        "",
        "```bash",
        "cd typescript",
        "npm install",
        "npm run build",
        "```",
        "",
        "## Usage",
        "",
        "```ts",
        f"import {{ {cls} }} from '{name}';",
        "",
        f"const client = new {cls}({{ defaultDelayMs: 1000 }});",
        f"const data = await client.{first}();",
        "console.log(data);",
        "```",
        "",
        "## Methods",
        "",
    ]
    for ep in endpoints:
        mid = safe_ident(ep["id"])
        lines.append(
            f"- `{mid}()` — {(ep.get('method') or 'GET')} `{ep.get('path') or ep.get('url')}` — {ep.get('summary', '')}"
        )
    lines += [
        "",
        "## Ethics",
        "",
        "See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.",
        "",
        "## Regenerate",
        "",
        "From Lankawa monorepo root:",
        "",
        "```bash",
        "python3 scripts/scaffold-ts-clients.py",
        "```",
        "",
    ]
    return "\n".join(lines)


def render_smoke(slug: str, endpoints: list[dict]) -> str:
    cls = class_name(slug)
    # pick first non-parked
    pick = None
    for ep in endpoints:
        if ep.get("status") == "parked" or "parked" in ep.get("id", ""):
            continue
        pick = ep
        break
    if not pick:
        return f'''import {{ {cls} }} from "../src/index.js";

async function main() {{
  const client = new {cls}({{ defaultDelayMs: 0 }});
  console.log("slug", {cls}.slug, "no live endpoints to smoke");
  void client;
}}

main().catch((err) => {{
  console.error(err);
  process.exit(1);
}});
'''
    name = safe_ident(pick["id"])
    return f'''import {{ {cls} }} from "../src/index.js";

/**
 * Live smoke — polite delay on. Run: npm run smoke
 * May fail if upstream is down / blocks this environment.
 */
async function main() {{
  const client = new {cls}({{ defaultDelayMs: 1000 }});
  console.log("smoke", {cls}.slug, "->", {ts_string(name)});
  const data = await client.{name}();
  const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
  console.log("ok", preview);
}}

main().catch((err) => {{
  console.error(err);
  process.exit(1);
}});
'''


def render_gitignore() -> str:
    return "node_modules/\ndist/\n*.tsbuildinfo\n"


def render_js_client(slug: str, meta: dict, endpoints: list[dict]) -> str:
    """Plain ESM JS twin of the TypeScript client (no build step)."""
    cls = class_name(slug)
    host = meta.get("host") or ""
    title = meta.get("title") or slug
    default_base = host if str(host).startswith("http") else ""
    methods = []
    for ep in endpoints:
        eid = ep["id"]
        name = safe_ident(eid)
        method = (ep.get("method") or "GET").upper()
        url = ep.get("url") or ""
        summary = (ep.get("summary") or "").replace("*/", "* /")
        status = ep.get("status") or "live"
        body = ep.get("body_json")
        pagination = ep.get("pagination")
        parked = status == "parked" or "parked" in eid

        if parked:
            methods.append(
                f'''  /** {summary} — PARKED */
  async {name}(_options = {{}}) {{
    throw new Error({ts_string(f"Parked endpoint: {eid} ({slug})")});
  }}'''
            )
            continue

        args = "options = {}"
        url_expr = f"this.resolveUrl({ts_string(url)}, options.query)"
        body_expr = "options.body"
        if body is not None:
            default_body = json.dumps(body, ensure_ascii=False)
            args = f"body = undefined, options = {{}}"
            body_expr = f"body !== undefined ? body : ({default_body})"
        if isinstance(pagination, dict) and pagination.get("lab"):
            style = (pagination.get("style") or "").lower()
            if "page_number" in style:
                args = "pageNumber = 1, size = 20, options = {}"
                url_expr = (
                    f"this.withQuery({ts_string(url)}, "
                    f"{{ page_number: pageNumber, size }}, options.query)"
                )
            elif "page_limit" in style or "limit_page" in style:
                args = "page = 1, limit = 50, options = {}"
                url_expr = (
                    f"this.withQuery({ts_string(url)}, "
                    f"{{ page, limit }}, options.query)"
                )
            elif "arcgis" in style:
                args = "resultOffset = 0, resultRecordCount = 50, options = {}"
                url_expr = (
                    f"this.withQuery({ts_string(url)}, "
                    f"{{ resultOffset, resultRecordCount }}, options.query)"
                )
            elif "group" in style:
                args = 'groupId = "A", options = {}'
                url_expr = (
                    f"this.withQuery({ts_string(url)}, "
                    f"{{ LoadShedGroupId: groupId }}, options.query)"
                )
            elif "pagerequest" in style:
                args = "index = 0, limit = 20, options = {}"
                if body is not None:
                    default_body = json.dumps(body, ensure_ascii=False)
                    body_expr = (
                        f"({{ ...({default_body}), pageRequest: {{ index, limit }} }})"
                    )
                else:
                    body_expr = "{ pageRequest: { index, limit } }"

        if method == "GET":
            call = f'return this.requestJson({url_expr}, {{ ...options, method: "GET" }});'
        else:
            call = (
                f"return this.requestJson({url_expr}, "
                f"{{ ...options, method: {ts_string(method)}, body: {body_expr} }});"
            )
        methods.append(
            f'''  /** {summary} */
  async {name}({args}) {{
    {call}
  }}'''
        )

    methods_block = "\n\n".join(methods) if methods else "  // no endpoints"
    return f'''/**
 * Unofficial JavaScript (ESM) client — {title}
 * Not affiliated. Public reads only. Polite delays (default 1s).
 * Twin of typescript/ — no build required (Node >= 18).
 */

const DEFAULT_UA = {ts_string(ua(slug))};

function sleep(ms) {{
  return new Promise((resolve) => setTimeout(resolve, ms));
}}

export class {cls} {{
  constructor(options = {{}}) {{
    this.baseUrl = (options.baseUrl ?? {ts_string(default_base)}).replace(/\\/$/, "");
    this.userAgent = options.userAgent ?? DEFAULT_UA;
    this.defaultDelayMs = options.defaultDelayMs ?? 1000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }}

  static slug = {ts_string(slug)};
  static title = {ts_string(title)};

  withQuery(url, defaults, extra) {{
    const u = new URL(url, this.baseUrl || undefined);
    for (const [k, v] of Object.entries({{ ...defaults, ...(extra ?? {{}}) }})) {{
      if (v === undefined || v === null) continue;
      u.searchParams.set(k, String(v));
    }}
    return u.toString();
  }}

  resolveUrl(url, query) {{
    if (!query || Object.keys(query).length === 0) {{
      if (url.startsWith("http")) return url;
      return `${{this.baseUrl}}${{url.startsWith("/") ? url : `/${{url}}`}}`;
    }}
    return this.withQuery(url, {{}}, query);
  }}

  async requestJson(url, options = {{}}) {{
    const delay = options.delayMs ?? this.defaultDelayMs;
    if (delay > 0) await sleep(delay);
    const method = (options.method ?? "GET").toUpperCase();
    const headers = {{
      Accept: "application/json, text/plain, */*",
      "User-Agent": this.userAgent,
      ...(options.headers ?? {{}}),
    }};
    let body;
    if (options.body !== undefined && method !== "GET" && method !== "HEAD") {{
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
      body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    }}
    const res = await this.fetchImpl(url, {{ method, headers, body, signal: options.signal }});
    const text = await res.text();
    if (!res.ok) {{
      throw new Error(`${{method}} ${{url}} -> ${{res.status}}: ${{text.slice(0, 280)}}`);
    }}
    if (!text) return undefined;
    try {{
      return JSON.parse(text);
    }} catch {{
      return text;
    }}
  }}

{methods_block}
}}

export default {cls};
'''


def render_js_readme(slug: str, title: str, endpoints: list[dict]) -> str:
    cls = class_name(slug)
    first = safe_ident(endpoints[0]["id"]) if endpoints else "ping"
    return f"""# JavaScript client — {title}

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import {{ {cls} }} from "./client.mjs";

const client = new {cls}({{ defaultDelayMs: 1000 }});
const data = await client.{first}();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
"""


def render_js_smoke(slug: str, endpoints: list[dict]) -> str:
    cls = class_name(slug)
    pick = next(
        (
            ep
            for ep in endpoints
            if ep.get("status") != "parked" and "parked" not in ep.get("id", "")
        ),
        None,
    )
    if not pick:
        return f'''import {{ {cls} }} from "../client.mjs";
console.log({cls}.slug, "no live endpoints");
'''
    name = safe_ident(pick["id"])
    return f'''import {{ {cls} }} from "../client.mjs";

const client = new {cls}({{ defaultDelayMs: 1000 }});
console.log("smoke", {cls}.slug, "->", {ts_string(name)});
const data = await client.{name}();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
'''


def scaffold_one(pkg_dir: Path) -> dict:
    slug = pkg_dir.name
    catalog_path = pkg_dir / "catalog" / "endpoints.yaml"
    package_yaml = pkg_dir / "PACKAGE.yaml"
    if not catalog_path.exists():
        raise FileNotFoundError(catalog_path)
    catalog = yaml.safe_load(catalog_path.read_text())
    meta = yaml.safe_load(package_yaml.read_text()) if package_yaml.exists() else {}
    meta.setdefault("title", catalog.get("title", slug))
    meta.setdefault("host", catalog.get("host", ""))
    endpoints = catalog.get("endpoints") or []

    ts_root = pkg_dir / "typescript"
    src = ts_root / "src"
    examples = ts_root / "examples"
    src.mkdir(parents=True, exist_ok=True)
    examples.mkdir(parents=True, exist_ok=True)

    (ts_root / "package.json").write_text(render_package_json(slug, meta["title"]))
    (ts_root / "tsconfig.json").write_text(render_tsconfig())
    (ts_root / ".gitignore").write_text(render_gitignore())
    (ts_root / "README.md").write_text(render_readme(slug, meta["title"], endpoints))
    (src / "client.ts").write_text(render_client(slug, meta, endpoints))
    (src / "catalog.ts").write_text(render_catalog_ts(endpoints))
    (src / "index.ts").write_text(render_index_ts(slug))
    (examples / "smoke.ts").write_text(render_smoke(slug, endpoints))

    # dual JS entry: plain ESM re-export note in examples
    (examples / "smoke.mjs").write_text(
        f'''// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import {{ {class_name(slug)} }} from "../dist/index.js";

const client = new {class_name(slug)}({{ defaultDelayMs: 1000 }});
console.log("client", {class_name(slug)}.slug, "methods ready");
void client;
'''
    )

    # Plain JS twin (no tsc)
    js_root = pkg_dir / "javascript"
    js_examples = js_root / "examples"
    js_examples.mkdir(parents=True, exist_ok=True)
    (js_root / "client.mjs").write_text(render_js_client(slug, meta, endpoints))
    (js_root / "package.json").write_text(
        json.dumps(
            {
                "name": f"{npm_name(slug)}-js",
                "version": "0.1.0",
                "type": "module",
                "main": "./client.mjs",
                "exports": {".": "./client.mjs"},
                "engines": {"node": ">=18"},
                "license": "MIT",
                "description": f"Unofficial JS ESM client for {meta['title']}",
            },
            indent=2,
        )
        + "\n"
    )
    (js_root / "README.md").write_text(render_js_readme(slug, meta["title"], endpoints))
    (js_examples / "smoke.mjs").write_text(render_js_smoke(slug, endpoints))

    return {
        "slug": slug,
        "npm": npm_name(slug),
        "className": class_name(slug),
        "endpointCount": len(endpoints),
        "methodCount": len(endpoints),
        "path": f"api-docs/packages/{slug}/typescript",
        "jsPath": f"api-docs/packages/{slug}/javascript",
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
        print("scaffolded", info["slug"], info["npm"], f"methods={info['methodCount']}")

    lines = [
        "# TypeScript + JavaScript clients — all packages",
        "",
        "Each staging package ships:",
        "",
        "- `typescript/` — typed client (`@cookie-cat21/<slug>-client`), build with `tsc`",
        "- `javascript/` — zero-build ESM twin (`client.mjs`, Node ≥18)",
        "",
        "Pattern mirrors Cookie-Cat21/cse-api-docs `python/` helpers (thin fetch wrappers + ethics).",
        "",
        "Regenerate: `python3 scripts/scaffold-ts-clients.py`",
        "",
        "| Package | npm name | Class | Methods | TypeScript | JavaScript |",
        "|---|---|---|---|---|---|",
    ]
    for r in rows:
        lines.append(
            f"| `{r['slug']}` | `{r['npm']}` | `{r['className']}` | {r['methodCount']} | `{r['path']}` | `{r['jsPath']}` |"
        )
    lines += [
        "",
        "## Quick start (TypeScript)",
        "",
        "```bash",
        "cd api-docs/packages/combank-api-docs/typescript",
        "npm install",
        "npm run typecheck",
        "# npm run smoke   # live network",
        "```",
        "",
        "## Quick start (JavaScript, no build)",
        "",
        "```bash",
        "cd api-docs/packages/combank-api-docs/javascript",
        "node examples/smoke.mjs",
        "```",
        "",
        "## Notes",
        "",
        "- Node ≥18 (native `fetch`)",
        "- Default delay 1000ms between calls",
        "- Parked endpoints throw instead of fetching",
        "- Pagination-lab endpoints accept page/limit/offset/group helpers",
        "- After extraction, publish from each repo’s `typescript/` and/or `javascript/` folder",
        "",
    ]
    INDEX_OUT.write_text("\n".join(lines))
    JSON_OUT.write_text(json.dumps({"version": 1, "clients": rows}, indent=2) + "\n")
    print("wrote", INDEX_OUT, "packages=", len(rows))


if __name__ == "__main__":
    main()
