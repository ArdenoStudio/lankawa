# TypeScript client — Standard Chartered + HSBC LK offers (park notes)

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/sc-hsbc-offers-park-docs-client` · Staging path: `api-docs/packages/sc-hsbc-offers-park-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { ScHsbcOffersParkDocsClient } from '@cookie-cat21/sc-hsbc-offers-park-docs-client';

const client = new ScHsbcOffersParkDocsClient({ defaultDelayMs: 1000 });
const data = await client.scTglOffersJsonParked();
console.log(data);
```

## Methods

- `scTglOffersJsonParked()` — GET `/lk/offers.json` — PARK — TGL offers.json mostly expired on probe.
- `hsbcRetailParked()` — GET `/` — PARK — HSBC LK retail sold to NTB; offer URLs dead.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
