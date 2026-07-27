# TypeScript client — SL Bank Supermarket Card Offers

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/sl-bank-card-offers-docs-client` · Staging path: `api-docs/packages/sl-bank-card-offers-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { SlBankCardOffersDocsClient } from '@cookie-cat21/sl-bank-card-offers-docs-client';

const client = new SlBankCardOffersDocsClient({ defaultDelayMs: 1000 });
const data = await client.packOverview();
console.log(data);
```

## Methods

- `packOverview()` — GET `(multi-host pack)` — Aggregator pack: Sampath + HNB Venus + ComBank HTML + peers → supermarket DOW.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
