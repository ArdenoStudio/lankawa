# TypeScript client — Bank of Ceylon Rates

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/boc-rates-docs-client` · Staging path: `api-docs/packages/boc-rates-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { BocRatesDocsClient } from '@cookie-cat21/boc-rates-docs-client';

const client = new BocRatesDocsClient({ defaultDelayMs: 1000 });
const data = await client.ratesTariffHtml();
console.log(data);
```

## Methods

- `ratesTariffHtml()` — GET `/rates-tariff` — Canonical FX + FD HTML — prefer over stale JSON.
- `interestRatesFdJsonParked()` — GET `/api/interest-rates-fd` — PARK — live JSON but wrong vs rates-tariff HTML.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
