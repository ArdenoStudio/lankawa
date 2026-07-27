# TypeScript client — SL Bank Fixed Deposit Rates

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/sl-bank-fd-rates-docs-client` · Staging path: `api-docs/packages/sl-bank-fd-rates-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { SlBankFdRatesDocsClient } from '@cookie-cat21/sl-bank-fd-rates-docs-client';

const client = new SlBankFdRatesDocsClient({ defaultDelayMs: 1000 });
const data = await client.packOverview();
console.log(data);
```

## Methods

- `packOverview()` — GET `(multi-host pack)` — Aggregator: ComBank/Sampath/Seylan/HNB FD JSON → unified ladder.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
