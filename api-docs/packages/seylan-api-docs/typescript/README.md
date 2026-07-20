# TypeScript client — Seylan Bank API

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/seylan-api-docs-client` · Staging path: `api-docs/packages/seylan-api-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { SeylanApiDocsClient } from '@cookie-cat21/seylan-api-docs-client';

const client = new SeylanApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.exchangeRatesUsd();
console.log(data);
```

## Methods

- `exchangeRatesUsd()` — GET `/api/exchange-rates-get-value/{CCY}` — Per-currency FX JSON.
- `getFdData()` — GET `/get-fd-data` — FD calculator JSON (Content-Type may lie text/html).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
