# TypeScript client — NTB Mastercard + Amex Offers

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/ntb-amex-offers-docs-client` · Staging path: `api-docs/packages/ntb-amex-offers-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { NtbAmexOffersDocsClient } from '@cookie-cat21/ntb-amex-offers-docs-client';

const client = new NtbAmexOffersDocsClient({ defaultDelayMs: 1000 });
const data = await client.ntbPromotionsHub();
console.log(data);
```

## Methods

- `ntbPromotionsHub()` — GET `/personal/cards/promotions` — NTB card promotions hub HTML.
- `amexSupermarketOffers()` — GET `/benefits/consumer/supermarket-offers/` — Amex LK supermarket offers HTML.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
