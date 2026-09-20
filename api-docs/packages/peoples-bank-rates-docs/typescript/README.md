# TypeScript client — People's Bank Rates

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/peoples-bank-rates-docs-client` · Staging path: `api-docs/packages/peoples-bank-rates-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { PeoplesBankRatesDocsClient } from '@cookie-cat21/peoples-bank-rates-docs-client';

const client = new PeoplesBankRatesDocsClient({ defaultDelayMs: 1000 });
const data = await client.exchangeRatesHtml();
console.log(data);
```

## Methods

- `exchangeRatesHtml()` — GET `/exchange-rates/` — FX TT HTML.
- `interestRatesHtml()` — GET `/interest-rates/` — Deposit/loan interest HTML.
- `offerCards()` — GET `/card-offers/` — Card offer listing HTML.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
