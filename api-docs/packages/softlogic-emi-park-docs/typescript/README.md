# TypeScript client — Softlogic EMI (park — heavy crawl)

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/softlogic-emi-park-docs-client` · Staging path: `api-docs/packages/softlogic-emi-park-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { SoftlogicEmiParkDocsClient } from '@cookie-cat21/softlogic-emi-park-docs-client';

const client = new SoftlogicEmiParkDocsClient({ defaultDelayMs: 1000 });
const data = await client.variationDetailParked();
console.log(data);
```

## Methods

- `variationDetailParked()` — GET `/variation-detail/{id}` — PARK — per-SKU EMI crawl too heavy vs Singer json-get-emi.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
