# TypeScript client — WFP HDX Sri Lanka Food Prices

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/wfp-hdx-lka-food-docs-client` · Staging path: `api-docs/packages/wfp-hdx-lka-food-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { WfpHdxLkaFoodDocsClient } from '@cookie-cat21/wfp-hdx-lka-food-docs-client';

const client = new WfpHdxLkaFoodDocsClient({ defaultDelayMs: 1000 });
const data = await client.wfpFoodPricesLkaCsv();
console.log(data);
```

## Methods

- `wfpFoodPricesLkaCsv()` — GET `/download/wfp_food_prices_lka.csv` — Full LKA CSV (~34k rows).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
