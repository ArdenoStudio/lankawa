# TypeScript client — Sampath Bank API

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/sampath-api-docs-client` · Staging path: `api-docs/packages/sampath-api-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { SampathApiDocsClient } from '@cookie-cat21/sampath-api-docs-client';

const client = new SampathApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.exchangeRates();
console.log(data);
```

## Methods

- `exchangeRates()` — GET `/api/exchange-rates` — TTBUY/TTSEL FX JSON.
- `ratesAndChargesExternal()` — GET `/api/rates-and-charges/external` — local.term_and_deposite FD slabs + savings.
- `cardPromotionsSuperMarkets()` — GET `/api/card-promotions` — Supermarket card offers JSON.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
