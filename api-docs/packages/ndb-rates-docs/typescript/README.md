# TypeScript client — NDB Rates

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/ndb-rates-docs-client` · Staging path: `api-docs/packages/ndb-rates-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { NdbRatesDocsClient } from '@cookie-cat21/ndb-rates-docs-client';

const client = new NdbRatesDocsClient({ defaultDelayMs: 1000 });
const data = await client.exchangeRates();
console.log(data);
```

## Methods

- `exchangeRates()` — GET `/rates-and-tariffs/exchange-rates` — FX rates HTML.
- `depositInterest()` — GET `/rates-and-tariffs/interest-rates-for-deposits` — Deposit interest HTML.
- `cardOffers()` — GET `/cards/offers` — Card offers HTML.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
