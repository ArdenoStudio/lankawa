# Standard Chartered + HSBC LK offers (park notes)

> Unofficial live-probed API documentation.
> **Not affiliated** with the upstream operator.

**Tier:** B · **Category:** cards

Staging path: `api-docs/packages/sc-hsbc-offers-park-docs/` → extract to `Cookie-Cat21/sc-hsbc-offers-park-docs`.

## Source research

- `docs/NTB_SC_HSBC_OFFERS_RESEARCH.md`
- `docs/BANK_API_DEEP_DIVE_VISA_SC_FDRATES.md`

## Quick start

```bash
cd api-docs/packages/sc-hsbc-offers-park-docs
pip install -r requirements.txt
python scripts/probe.py
python scripts/build_site.py
```

## Clients

- TypeScript: [`typescript/`](./typescript/) — `@cookie-cat21/sc-hsbc-offers-park-docs-client`
- JavaScript (ESM, no build): [`javascript/`](./javascript/) — `client.mjs`
