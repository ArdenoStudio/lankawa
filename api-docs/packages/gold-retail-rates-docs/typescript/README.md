# TypeScript client — Gold retail rates research pack

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/gold-retail-rates-docs-client` · Staging path: `api-docs/packages/gold-retail-rates-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { GoldRetailRatesDocsClient } from '@cookie-cat21/gold-retail-rates-docs-client';

const client = new GoldRetailRatesDocsClient({ defaultDelayMs: 1000 });
const data = await client.cbslGoldPage();
console.log(data);
```

## Methods

- `cbslGoldPage()` — GET `(see GOLD_RETAIL_RATES_RESEARCH.md)` — CBSL + jeweller retail gold scrape notes.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
