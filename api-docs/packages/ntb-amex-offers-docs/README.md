# NTB Mastercard + Amex Offers

> Unofficial live-probed API documentation.
> **Not affiliated** with the upstream operator. Data may change without notice.

**Tier:** B · **Category:** cards · **Status:** ready

NTB promotions/hub + americanexpress.lk supermarket-offers.

Pattern siblings: [cse-api-docs](https://github.com/Cookie-Cat21/cse-api-docs) · [ikman-api-docs](https://github.com/Cookie-Cat21/ikman-api-docs)

## Staging note

This package currently lives inside the Lankawa monorepo at `api-docs/packages/ntb-amex-offers-docs/`.
**Extract to** public repo `Cookie-Cat21/ntb-amex-offers-docs` using [`api-docs/EXTRACTION_PROMPT.md`](../../EXTRACTION_PROMPT.md).

## Source research (Lankawa)

- `docs/NTB_SC_HSBC_OFFERS_RESEARCH.md`

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
cd api-docs/packages/ntb-amex-offers-docs
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python scripts/probe.py
python scripts/build_site.py
```

## License

MIT for docs/harness. Upstream data remains subject to upstream terms.
