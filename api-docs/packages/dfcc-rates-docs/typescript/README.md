# TypeScript client — DFCC Rates & Card Offers

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/dfcc-rates-docs-client` · Staging path: `api-docs/packages/dfcc-rates-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { DfccRatesDocsClient } from '@cookie-cat21/dfcc-rates-docs-client';

const client = new DfccRatesDocsClient({ defaultDelayMs: 1000 });
const data = await client.interestRatesPage();
console.log(data);
```

## Methods

- `interestRatesPage()` — GET `/interest-rates/` — RSC-embedded deposit/loan rates.
- `exchangeRatesPage()` — GET `/exchange-rates/` — FX rates page.
- `cardOffersSupermarket()` — GET `/personal/cards/card-offers/` — Card offers hub (supermarket DOW scrape).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
