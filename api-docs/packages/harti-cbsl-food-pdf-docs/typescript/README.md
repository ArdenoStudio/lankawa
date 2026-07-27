# TypeScript client — HARTI + CBSL Food Price PDFs

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/harti-cbsl-food-pdf-docs-client` · Staging path: `api-docs/packages/harti-cbsl-food-pdf-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { HartiCbslFoodPdfDocsClient } from '@cookie-cat21/harti-cbsl-food-pdf-docs-client';

const client = new HartiCbslFoodPdfDocsClient({ defaultDelayMs: 1000 });
const data = await client.hartiDailyPricesIndex();
console.log(data);
```

## Methods

- `hartiDailyPricesIndex()` — GET `/market-information/daily-prices` — HARTI daily price PDF index.
- `cbslWeeklyFood()` — GET `/en/statistics/economic-indicators` — CBSL food/economic indicator PDF entry points.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
