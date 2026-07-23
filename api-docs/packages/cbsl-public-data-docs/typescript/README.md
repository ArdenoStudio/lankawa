# TypeScript client — CBSL Public Data

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/cbsl-public-data-docs-client` · Staging path: `api-docs/packages/cbsl-public-data-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { CbslPublicDataDocsClient } from '@cookie-cat21/cbsl-public-data-docs-client';

const client = new CbslPublicDataDocsClient({ defaultDelayMs: 1000 });
const data = await client.plratesHtml();
console.log(data);
```

## Methods

- `plratesHtml()` — GET `/en/rates-and-indicators/policy-rates` — Policy rates page (OPR / corridor context).
- `historicalPolicyXlsx()` — GET `/historical_policy_interest_rates.xlsx` — Historical SDFR/SLFR/OPR Excel tip.
- `eresearchTbill6169()` — GET `/eresearch/.../6169` — Secondary market T-bill yields (91/182/364).
- `eresearchAwpr6277()` — GET `/eresearch/.../6277` — Weekly AWPR series.
- `paymentsBulletinIndex()` — GET `/en/payments-and-settlements/payments-bulletin` — Payments bulletin PDF index.
- `fxBuyingSellingHtml()` — GET `/en/rates-and-indicators/exchange-rates` — CBSL indicative FX HTML tables.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
