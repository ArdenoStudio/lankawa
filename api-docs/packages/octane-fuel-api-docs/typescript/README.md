# TypeScript client — Octane Fuel API

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/octane-fuel-api-docs-client` · Staging path: `api-docs/packages/octane-fuel-api-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { OctaneFuelApiDocsClient } from '@cookie-cat21/octane-fuel-api-docs-client';

const client = new OctaneFuelApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.pricesLatest();
console.log(data);
```

## Methods

- `pricesLatest()` — GET `/v1/prices/latest` — Latest fuel prices.
- `comparisonWorld()` — GET `/v1/comparison/world` — World pump compare.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
