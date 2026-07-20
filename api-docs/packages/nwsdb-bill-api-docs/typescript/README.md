# TypeScript client — NWSDB Bill Calculator API

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/nwsdb-bill-api-docs-client` · Staging path: `api-docs/packages/nwsdb-bill-api-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { NwsdbBillApiDocsClient } from '@cookie-cat21/nwsdb-bill-api-docs-client';

const client = new NwsdbBillApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.billCalculator();
console.log(data);
```

## Methods

- `billCalculator()` — POST `/api_nwsdb/bill/BillCalculator` — Domestic bill estimate.
- `getTariffAdjustment()` — GET `/api_nwsdb/bill/getTariffAdjustment` — Tariff adjustment metadata.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
