# Litro + LAUGFS LPG price pages

> Unofficial live-probed API documentation.
> **Not affiliated** with the upstream operator.

**Tier:** B · **Category:** fuel

Staging path: `api-docs/packages/litro-laugfs-lpg-docs/` → extract to `Cookie-Cat21/litro-laugfs-lpg-docs`.

## Source research

- `docs/INTEGRATIONS.md`
- `docs/EXISTING_APIS_UNUSED_ENDPOINTS.md`

## Quick start

```bash
cd api-docs/packages/litro-laugfs-lpg-docs
pip install -r requirements.txt
python scripts/probe.py
python scripts/build_site.py
```

## Clients

- Python: [`python/`](./python/) — `litro-laugfs-lpg-docs-unofficial` (`pip install -e .`)
- TypeScript: [`typescript/`](./typescript/) — `@cookie-cat21/litro-laugfs-lpg-docs-client`
- JavaScript (ESM, no build): [`javascript/`](./javascript/) — `client.mjs`
