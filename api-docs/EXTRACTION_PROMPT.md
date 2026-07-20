# Claude extraction prompt — split Lankawa `api-docs/packages/*` into public repos

Copy everything below the line into Claude (or another coding agent) after this PR is merged (or while checking out the PR branch). Goal: turn each staging package into its **own** public GitHub repository under `Cookie-Cat21/`, matching the quality bar of [cse-api-docs](https://github.com/Cookie-Cat21/cse-api-docs) and [ikman-api-docs](https://github.com/Cookie-Cat21/ikman-api-docs).

---

## Prompt (copy from here)

You are extracting **unofficial Sri Lanka API documentation packages** from the Lankawa monorepo into separate public GitHub repositories.

### Source of truth

- **Monorepo:** `https://github.com/ArdenoStudio/lankawa`
- **Staging root:** `api-docs/`
- **Machine index:** `api-docs/INDEX.yaml` (also mirrored at `src/lib/api-docs-catalog.json`)
- **Pattern siblings (match these closely):**
  - https://github.com/Cookie-Cat21/cse-api-docs
  - https://github.com/Cookie-Cat21/ikman-api-docs
- **In-app explorer (reference UX only; do not couple extracted repos to Next.js):**
  - `/developers/api-catalog`
  - `/developers/api-catalog/pagination-lab`

### Hard rules

1. **One package → one public repo.** For every directory `api-docs/packages/<slug>/`, create `https://github.com/Cookie-Cat21/<slug>` (org may already exist; use Cookie-Cat21 unless told otherwise).
2. **Do Tier A first, then Tier B.** Process packages in `INDEX.yaml` order, or sort by `tier` then `slug`. Skip nothing unless `status: parked` *and* the package is only a park stub *and* you decide to keep a minimal “park notice” README (still create the repo — parks are documentation too).
3. **Never invent live credentials.** No banking logins, OTP, reCAPTCHA bypass, Sucuri cookie farms beyond documenting that a cookie may be required, no SelfCare/account endpoints.
4. **Ethics banner everywhere:** README top + generated `site/index.html` must say: *Unofficial community documentation. Not affiliated with the upstream operator. Data may change without notice.*
5. **MIT applies only to docs/harness.** Upstream data remains subject to upstream terms. Keep `docs/ETHICS.md`.
6. **Polite probes:** default ≥1s delay; backoff on 429/403; UA like `CookieCatApiDocsBot/1.0 (+https://github.com/Cookie-Cat21/<slug>)`.
7. **No PII in samples.** Redact phones, emails, account numbers, bill account IDs.
8. **Do not publish secrets.** No FIRMS `MAP_KEY` in git — document env var. No Visa session cookies.
9. **Pagination lab endpoints** (`pagination.lab: true` in YAML) must get a dedicated `docs/PAGINATION.md` section with parameter tables and curl examples for page 1 vs page 2 (or offset 0 vs N).
10. **Field coverage:** Copy the relevant rows for this slug from `api-docs/FIELD_COVERAGE_MATRIX.md` into `docs/FIELD_COVERAGE.md` (canonical fields + Y/P/N/K). Expand with native upstream field names → canonical map (see Lankawa `docs/BANK_FD_API_SCHEMAS.md` for FD style).
11. **Link back** in each README: “Research staged in ArdenoStudio/lankawa `api-docs/packages/<slug>`” and cite `source_docs_in_lankawa` paths.
12. **GitHub Pages** via `.github/workflows/pages.yml` building `site/` from `scripts/build_site.py`.
13. **Weekly probe** via `.github/workflows/probe.yml` (Monday cron + workflow_dispatch), upload `catalog/last_probe.json` + `samples/` as artifacts.
14. **Do not copy Lankawa product UI** (Next.js, i18n, teal cards). Extracted repos are static docs + Python harness only.
15. **Commit quality:** conventional, descriptive commits; meaningful initial README; tag `v0.1.0` after first green probe (optional but preferred).
16. **If an endpoint 404s/500s on first probe:** keep it in `endpoints.yaml` with `status: degraded|parked` and a note — do not silently delete research.

### Per-package checklist (run for EVERY slug)

```text
[ ] Create empty public repo Cookie-Cat21/<slug>
[ ] Copy package tree contents to repo root (not nested under packages/)
[ ] Rewrite README absolute links (remove ../../ EXTRACTION_PROMPT refs; keep ethics)
[ ] Expand catalog/endpoints.yaml:
      - method, url, path, summary, status
      - headers / body_json where needed
      - pagination block (style, params, lab)
      - response_shape notes (key fields) when known from Lankawa deep-dives
[ ] Copy relevant prose from Lankawa docs listed in source_docs into docs/RESEARCH.md
      (summarize; do not dump entire monorepo)
[ ] docs/ETHICS.md present
[ ] docs/PAGINATION.md if any endpoint has pagination.lab: true
[ ] examples/curl.md with real curl against public URLs
[ ] python/ polished helper (from staging) — `pip install -e .` + `python smoke.py`; keep setup.py/pyproject.toml
[ ] typescript/ client (from staging) — `npm install && npm run typecheck`; keep README + smoke
[ ] javascript/ client (from staging) — zero-build `client.mjs`; `node examples/smoke.mjs`
[ ] scripts/probe.py works locally
[ ] scripts/build_site.py writes site/index.html
[ ] .github/workflows/probe.yml + pages.yml
[ ] LICENSE (MIT harness)
[ ] requirements.txt
[ ] Run probe once; commit redacted samples/ if safe (or gitignore samples and keep artifact-only)
[ ] Enable GitHub Pages (Actions source)
[ ] Add topics: sri-lanka, unofficial-api, api-docs, <category>
[ ] Open a short tracking issue in lankawa OR comment on the staging PR listing the new repo URL
```

### Enrichment expectations (do not ship empty stubs)

For bank packages, pull shapes from Lankawa research where available:

| Package family | Must document |
|----------------|---------------|
| `combank-api-docs` | `/api/exchange-rates`, `/api/interest-rates-fd`, rewards HTML DOW scrape |
| `hnb-venus-api-docs` | FX web, card promos page/limit (+ debit), interest tables, promo detail `id=` |
| `sampath-api-docs` | FX, rates-and-charges/external, card-promotions page_number/size |
| `seylan-api-docs` | per-currency FX, get-fd-data |
| `cse-api-docs-deepen` | topGainers, topLooses, 52WeekSectors, tradeSummary; note existing cse-api-docs overlap — deepen pack should **extend** not replace |
| `cebcare-api-docs` | antiforgery flow + GetDemandMgmtClusters A–Y |
| `nwsdb-bill-api-docs` | BillCalculator POST body + tariff adjustment |
| `irrigation-arcgis-api-docs` | gauges_2_view + 24hr_rainfall ArcGIS paging |
| `visa-lk-perks-api-docs` | portal perks POST + pageRequest |
| `foodlk-api-docs` | openapi + hub/manifest canary + basket (note 500s honestly) |
| `wfp-hdx-lka-food-docs` | full CSV download; client-side chunk lab |
| `cbsl-public-data-docs` | plrates, policy xlsx, eResearch 6169/6277, payments bulletin |
| Aggregator packs (`sl-bank-*`) | Point to sibling repos; document unified field mapping |

For **park** packages (`mypromo-park-docs`, `softlogic-emi-park-docs`, `sc-hsbc-offers-park-docs`, BOC stale JSON): keep a clear **PARK** section explaining why Lankawa will not scrape, with date of decision from research docs.

### Suggested extraction order

1. Tier A JSON banks: `combank-api-docs`, `sampath-api-docs`, `hnb-venus-api-docs`, `seylan-api-docs`
2. Tier A civic: `cebcare-api-docs`, `nwsdb-bill-api-docs`, `irrigation-arcgis-api-docs`, `cse-api-docs-deepen`, `cbsl-public-data-docs`
3. Tier A food/fuel/weather: `foodlk-api-docs`, `wfp-hdx-lka-food-docs`, `open-meteo-lk-docs`, `openaq-lk-docs`, `visa-lk-perks-api-docs`, `lk-flood-api-docs`
4. Tier B banks HTML + packs
5. Tier B parks + long-tail (`gold-retail-rates-docs`, `promise-lk-tenders-docs`, …)

### Deliverables when you finish

1. Public repo URLs for **all** packages in `INDEX.yaml` (`package_count` should match).
2. A markdown table: `| slug | tier | repo | pages_url | last_probe_ok |`
3. List of endpoints that failed probe (keep documented).
4. Any packages you intentionally deferred — with reason (should be rare).
5. Do **not** delete `api-docs/` from Lankawa in the same change set; open a follow-up PR later to replace package bodies with thin pointers to the public repos if desired.

### Quality bar (definition of done per repo)

- README can stand alone without reading Lankawa.
- `catalog/endpoints.yaml` validates as YAML and lists ≥1 real URL.
- `python scripts/probe.py` exits 0 even if some endpoints are non-200 (report file written).
- `python scripts/build_site.py` produces a usable table.
- Ethics + “not affiliated” visible above the fold on Pages.
- Pagination lab endpoints have curl for at least two pages/offsets/groups.

### Start command

```bash
git clone https://github.com/ArdenoStudio/lankawa.git
cd lankawa
# optional: checkout the api-docs PR branch if not on main yet
python3 - <<'PY'
import yaml
from pathlib import Path
idx = yaml.safe_load(Path('api-docs/INDEX.yaml').read_text())
for p in idx['packages']:
    print(f"{p['tier']}\t{p['slug']}\t{p.get('extract_to')}\tendpoints={p.get('endpoint_count')}")
PY
```

Then, for each slug, create the repo and push. Work autonomously; batch commits per package; prefer thorough docs over speed.

## End of prompt
