# Visa LK Perks API

> Unofficial live-probed API documentation.
> **Not affiliated** with the upstream operator. Data may change without notice.

**Tier:** A · **Category:** cards · **Status:** ready

VMORC portal perks POST — supermarket/Glomark slice.

Pattern siblings: [cse-api-docs](https://github.com/Cookie-Cat21/cse-api-docs) · [ikman-api-docs](https://github.com/Cookie-Cat21/ikman-api-docs)

## Staging note

This package currently lives inside the Lankawa monorepo at `api-docs/packages/visa-lk-perks-api-docs/`.
**Extract to** public repo `Cookie-Cat21/visa-lk-perks-api-docs` using [`api-docs/EXTRACTION_PROMPT.md`](../../EXTRACTION_PROMPT.md).

## Source research (Lankawa)

- `docs/BANK_API_DEEP_DIVE_VISA_SC_FDRATES.md`

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
cd api-docs/packages/visa-lk-perks-api-docs
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python scripts/probe.py
python scripts/build_site.py
```


## Clients

- Python: [`python/`](./python/) — `visa-lk-perks-api-docs-unofficial` (`pip install -e .`)
- TypeScript: [`typescript/`](./typescript/) — `@cookie-cat21/visa-lk-perks-api-docs-client`
- JavaScript (ESM, no build): [`javascript/`](./javascript/) — `client.mjs`

## License

MIT for docs/harness. Upstream data remains subject to upstream terms.
