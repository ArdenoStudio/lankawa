# TypeScript client — Ardeno Sister Backends

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/ardeno-sister-backends-docs-client` · Staging path: `api-docs/packages/ardeno-sister-backends-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { ArdenoSisterBackendsDocsClient } from '@cookie-cat21/ardeno-sister-backends-docs-client';

const client = new ArdenoSisterBackendsDocsClient({ defaultDelayMs: 1000 });
const data = await client.foodlkOpenapi();
console.log(data);
```

## Methods

- `foodlkOpenapi()` — GET `food-platform-backend.fly.dev/openapi.json` — FoodLK OpenAPI.
- `octanePrices()` — GET `octane-api.fly.dev/v1/prices/latest` — Octane latest prices.
- `lifeHealth()` — GET `life-platform-api.fly.dev/health` — Life platform health (host may vary).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
