# TypeScript client — Singer Sri Lanka EMI API

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/singer-emi-api-docs-client` · Staging path: `api-docs/packages/singer-emi-api-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { SingerEmiApiDocsClient } from '@cookie-cat21/singer-emi-api-docs-client';

const client = new SingerEmiApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.jsonGetEmi();
console.log(data);
```

## Methods

- `jsonGetEmi()` — GET `/json-get-emi` — Multi-bank EMI rows for a SKU.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
