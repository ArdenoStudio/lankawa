# TypeScript client — FoodLK / Food Platform API

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/foodlk-api-docs-client` · Staging path: `api-docs/packages/foodlk-api-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { FoodlkApiDocsClient } from '@cookie-cat21/foodlk-api-docs-client';

const client = new FoodlkApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.openapi();
console.log(data);
```

## Methods

- `openapi()` — GET `/openapi.json` — Full OpenAPI (41 paths).
- `hubManifest()` — GET `/api/v1/hub/manifest` — Often 200 when hub/summary is 500.
- `hubSummary()` — GET `/api/v1/hub/summary` — Preferred Lankawa surface — frequently 500.
- `basketEstimate()` — GET `/api/v1/basket/estimate` — Essentials staples preset.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
