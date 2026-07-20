# Sri Lanka unofficial API docs — Lankawa staging catalog

Staging monorepo for **Cookie-Cat21-style** `*-api-docs` packages (same pattern as [cse-api-docs](https://github.com/Cookie-Cat21/cse-api-docs) and [ikman-api-docs](https://github.com/Cookie-Cat21/ikman-api-docs)).

Each folder under `packages/<slug>/` is designed to become its **own public GitHub repo** (`Cookie-Cat21/<slug>`). Do **not** treat this tree as the long-term home — extract using [`EXTRACTION_PROMPT.md`](./EXTRACTION_PROMPT.md).

## What’s here

| Path | Role |
|------|------|
| `INDEX.yaml` | Machine index of all packages (tiers, categories, lab endpoints) |
| `packages/<slug>/` | One extractable docs package |
| `shared/ETHICS.md` | Shared ethics / rate-limit rules |
| `../src/lib/api-docs-catalog.json` | App mirror of INDEX for `/developers/api-catalog` |
| `MISSED_AND_BACKLOG.md` | Surfaces added after the first Tier A/B pass + parks |
| `FIELD_COVERAGE_MATRIX.yaml` / `.md` | Canonical field coverage (Y/P/N/K) across all packages |
| `../src/lib/api-docs-field-coverage.json` | App mirror for `/developers/api-catalog/field-coverage` |
| `TYPESCRIPT_CLIENTS.md` | Index of TS + JS clients for every package |
| `PYTHON_CLIENTS.md` | Index of polished Python packages for every package |
| `CLIENT_EXTRAS.md` | Typed models + pagination iterator + shard helper (all stacks) |
| `packages/<slug>/typescript/` | Typed unofficial client (`npm run typecheck`) |
| `packages/<slug>/javascript/` | Zero-build ESM twin (`client.mjs`) |
| `packages/<slug>/python/` | Installable unofficial helper (`pip install -e .`) |

## Tiers

- **A** — JSON / clear machine surfaces (banks Venus/ComBank/Sampath, CSE deepen, CEB, NWSDB, Irrigation, FoodLK, WFP, OpenAQ, …)
- **B** — HTML scrape contracts, multi-host packs, or explicit parks (NSB/DFCC/BOC HTML, card aggregators, MyPromo park, Softlogic park, …)

## Package layout (every slug)

```
catalog/endpoints.yaml   # source of truth
samples/                 # probe artefacts (gitignored or redacted)
scripts/probe.py
scripts/build_site.py
docs/ETHICS.md
examples/
python/                  # installable unofficial helper (cse-api-docs style)
typescript/              # typed unofficial client
javascript/              # zero-build ESM twin
site/                    # static Pages output
.github/workflows/probe.yml
.github/workflows/pages.yml
PACKAGE.yaml
README.md
LICENSE                  # MIT for harness only
requirements.txt
```

## Regenerate / enrich

```bash
python3 scripts/scaffold-api-docs.py   # initial scaffold (idempotent-ish)
python3 scripts/enrich-api-docs.py     # fill stubs, add missed, rebuild INDEX + JSON
python3 scripts/build-field-coverage-matrix.py  # FIELD_COVERAGE_MATRIX + app JSON
python3 scripts/scaffold-ts-clients.py          # typescript/ + javascript/ clients for all packages
python3 scripts/scaffold-py-clients.py          # polish python/ packages for all packages
python3 scripts/scaffold-client-extras.py       # models + pagination iterator + shard helper
```

## In-app explorer

- Category explorer: `/[locale]/developers/api-catalog`
- Pagination lab: `/[locale]/developers/api-catalog/pagination-lab`
- Field coverage matrix: `/[locale]/developers/api-catalog/field-coverage`
- TS/JS clients index: `/[locale]/developers/api-catalog/ts-clients`
- Python clients index: `/[locale]/developers/api-catalog/py-clients`
- Client extras (models/pagination/shard): see `CLIENT_EXTRAS.md`

Lab endpoints are those with `pagination.lab: true` in `catalog/endpoints.yaml` (HNB page/limit, Sampath page_number, ArcGIS offset, Visa pageRequest, CEB A–Y groups, CSE client slice, WFP full download, …).

## Compliance

Unofficial. Not affiliated with upstream operators. Public reads only. Polite delays. No PII in samples. Upstream ToS wins — see `shared/ETHICS.md` and each package `docs/ETHICS.md`.

## Extract next

1. Merge this PR into Lankawa.
2. Give Claude (or another agent) the full prompt in [`EXTRACTION_PROMPT.md`](./EXTRACTION_PROMPT.md).
3. Create one public repo per package under `Cookie-Cat21/`.
4. Enable GitHub Pages + weekly probe workflow on each.
