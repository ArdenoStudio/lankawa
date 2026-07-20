# Gold retail rates research pack

> Unofficial live-probed API documentation.
> **Not affiliated** with the upstream operator.

**Tier:** B · **Category:** macro

Staging path: `api-docs/packages/gold-retail-rates-docs/` → extract to `Cookie-Cat21/gold-retail-rates-docs`.

## Source research

- `docs/GOLD_RETAIL_RATES_RESEARCH.md`
- `docs/CBSL_RATES_API_DEEP_DIVE.md`

## Quick start

```bash
cd api-docs/packages/gold-retail-rates-docs
pip install -r requirements.txt
python scripts/probe.py
python scripts/build_site.py
```

## Clients

- TypeScript: [`typescript/`](./typescript/) — `@cookie-cat21/gold-retail-rates-docs-client`
- JavaScript (ESM, no build): [`javascript/`](./javascript/) — `client.mjs`
