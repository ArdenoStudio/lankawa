# TypeScript client — Commercial Bank API

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/combank-api-docs-client` · Staging path: `api-docs/packages/combank-api-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { CombankApiDocsClient } from '@cookie-cat21/combank-api-docs-client';

const client = new CombankApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.exchangeRates();
console.log(data);
```

## Methods

- `exchangeRates()` — GET `/api/exchange-rates` — Multi-currency TT/DD rates JSON (USD TT buy/sell).
- `interestRatesFd()` — GET `/api/interest-rates-fd` — FD ladder array: paidIn, period (months), rate.
- `rewardsPromotionsHtml()` — GET `/rewards-promotions` — HTML rewards list (~72); supermarket DOW scrape.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
