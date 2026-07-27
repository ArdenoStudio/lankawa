# MyPromo.lk (park — ToS)

> Unofficial live-probed API documentation.
> **Not affiliated** with the upstream operator.

**Tier:** B · **Category:** cards

Staging path: `api-docs/packages/mypromo-park-docs/` → extract to `Cookie-Cat21/mypromo-park-docs`.

## Source research

- `docs/BANK_AND_API_UNIVERSE.md`
- `docs/CONSUMER_OFFERS_AND_DATA_SURVEY.md`

## Quick start

```bash
cd api-docs/packages/mypromo-park-docs
pip install -r requirements.txt
python scripts/probe.py
python scripts/build_site.py
```

## Clients

- Python: [`python/`](./python/) — `mypromo-park-docs-unofficial` (`pip install -e .`)
- TypeScript: [`typescript/`](./typescript/) — `@cookie-cat21/mypromo-park-docs-client`
- JavaScript (ESM, no build): [`javascript/`](./javascript/) — `client.mjs`
