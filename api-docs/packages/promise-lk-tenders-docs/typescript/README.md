# TypeScript client — Promise.lk tenders

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/promise-lk-tenders-docs-client` · Staging path: `api-docs/packages/promise-lk-tenders-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { PromiseLkTendersDocsClient } from '@cookie-cat21/promise-lk-tenders-docs-client';

const client = new PromiseLkTendersDocsClient({ defaultDelayMs: 1000 });
const data = await client.procurementsList();
console.log(data);
```

## Methods

- `procurementsList()` — GET `/` — Public procurement listings (scrape/API as probed).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
