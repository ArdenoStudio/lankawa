# SANASA Development Bank rates

> Unofficial live-probed API documentation.
> **Not affiliated** with the upstream operator.

**Tier:** B · **Category:** banks

Staging path: `api-docs/packages/sdb-rates-docs/` → extract to `Cookie-Cat21/sdb-rates-docs`.

## Source research

- `docs/AMANA_PABC_SDB_OFFERS_RESEARCH.md`

## Quick start

```bash
cd api-docs/packages/sdb-rates-docs
pip install -r requirements.txt
python scripts/probe.py
python scripts/build_site.py
```

## Clients

- TypeScript: [`typescript/`](./typescript/) — `@cookie-cat21/sdb-rates-docs-client`
- JavaScript (ESM, no build): [`javascript/`](./javascript/) — `client.mjs`
