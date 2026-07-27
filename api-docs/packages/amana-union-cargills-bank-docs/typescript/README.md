# TypeScript client — Amana / Union / Cargills Bank rates & offers

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/amana-union-cargills-bank-docs-client` · Staging path: `api-docs/packages/amana-union-cargills-bank-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { AmanaUnionCargillsBankDocsClient } from '@cookie-cat21/amana-union-cargills-bank-docs-client';

const client = new AmanaUnionCargillsBankDocsClient({ defaultDelayMs: 1000 });
const data = await client.amanaRates();
console.log(data);
```

## Methods

- `amanaRates()` — GET `amanabank.lk/rates/` — Amana rates pages (Islamic products).
- `unionBankOffers()` — GET `unionb.com/.../offers` — Union Bank card offers HTML.
- `cargillsBankRates()` — GET `cargillsbank.com/rates-and-tariffs/` — Cargills Bank rates & tariffs.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
