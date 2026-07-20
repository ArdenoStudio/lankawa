# Sampath Bank API

> Unofficial live-probed API documentation.
> **Not affiliated** with the upstream operator. Data may change without notice.

**Tier:** A · **Category:** banks · **Status:** ready

exchange-rates TTBUY/TTSEL, rates-and-charges/external FD, card-promotions.

Pattern siblings: [cse-api-docs](https://github.com/Cookie-Cat21/cse-api-docs) · [ikman-api-docs](https://github.com/Cookie-Cat21/ikman-api-docs)

## Staging note

This package currently lives inside the Lankawa monorepo at `api-docs/packages/sampath-api-docs/`.
**Extract to** public repo `Cookie-Cat21/sampath-api-docs` using [`api-docs/EXTRACTION_PROMPT.md`](../../EXTRACTION_PROMPT.md).

## Source research (Lankawa)

- `docs/BANK_API_DEEP_DIVE_SAMPATH_SEYLAN_NSB.md`
- `docs/BANK_FD_API_SCHEMAS.md`

## Layout

```
catalog/endpoints.yaml
samples/
scripts/probe.py
scripts/build_site.py
docs/ETHICS.md
examples/
python/
site/
```

## Quick start

```bash
cd api-docs/packages/sampath-api-docs
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python scripts/probe.py
python scripts/build_site.py
```

## License

MIT for docs/harness. Upstream data remains subject to upstream terms.
