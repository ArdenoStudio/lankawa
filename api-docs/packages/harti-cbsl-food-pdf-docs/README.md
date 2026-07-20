# HARTI + CBSL Food Price PDFs

> Unofficial live-probed API documentation.
> **Not affiliated** with the upstream operator. Data may change without notice.

**Tier:** B · **Category:** food · **Status:** ready

Daily/weekly PDF indexes — civic fresh food (not supermarket JSON).

Pattern siblings: [cse-api-docs](https://github.com/Cookie-Cat21/cse-api-docs) · [ikman-api-docs](https://github.com/Cookie-Cat21/ikman-api-docs)

## Staging note

This package currently lives inside the Lankawa monorepo at `api-docs/packages/harti-cbsl-food-pdf-docs/`.
**Extract to** public repo `Cookie-Cat21/harti-cbsl-food-pdf-docs` using [`api-docs/EXTRACTION_PROMPT.md`](../../EXTRACTION_PROMPT.md).

## Source research (Lankawa)

- `docs/HARTI_CBSL_FOOD_PDF.md`

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
cd api-docs/packages/harti-cbsl-food-pdf-docs
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python scripts/probe.py
python scripts/build_site.py
```

## License

MIT for docs/harness. Upstream data remains subject to upstream terms.
