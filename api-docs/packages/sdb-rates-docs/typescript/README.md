# TypeScript client — SANASA Development Bank rates

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/sdb-rates-docs-client` · Staging path: `api-docs/packages/sdb-rates-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { SdbRatesDocsClient } from '@cookie-cat21/sdb-rates-docs-client';

const client = new SdbRatesDocsClient({ defaultDelayMs: 1000 });
const data = await client.ratesPage();
console.log(data);
```

## Methods

- `ratesPage()` — GET `/rates/` — SDB rates HTML surfaces.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
