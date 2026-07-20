# TypeScript client — SL Bank Remittance TT Rates

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/sl-bank-remittance-tt-docs-client` · Staging path: `api-docs/packages/sl-bank-remittance-tt-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { SlBankRemittanceTtDocsClient } from '@cookie-cat21/sl-bank-remittance-tt-docs-client';

const client = new SlBankRemittanceTtDocsClient({ defaultDelayMs: 1000 });
const data = await client.packOverview();
console.log(data);
```

## Methods

- `packOverview()` — GET `(multi-host pack)` — Aggregator: ComBank/Sampath/HNB/Seylan/NSB/DFCC/BOC/People's/NDB TT boards.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
