# TypeScript client — NSB Rates Pages

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/nsb-rates-docs-client` · Staging path: `api-docs/packages/nsb-rates-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { NsbRatesDocsClient } from '@cookie-cat21/nsb-rates-docs-client';

const client = new NsbRatesDocsClient({ defaultDelayMs: 1000 });
const data = await client.depositRatesHtml();
console.log(data);
```

## Methods

- `depositRatesHtml()` — GET `/rates-tarriffs/deposit-rates/` — Deposit rates HTML (note path typo tarriffs).
- `exchangeRatesHtml()` — GET `/rates-tarriffs/exchange-rates/` — FX TT HTML board.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
