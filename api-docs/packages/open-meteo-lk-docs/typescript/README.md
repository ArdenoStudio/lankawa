# TypeScript client — Open-Meteo Sri Lanka Recipes

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/open-meteo-lk-docs-client` · Staging path: `api-docs/packages/open-meteo-lk-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { OpenMeteoLkDocsClient } from '@cookie-cat21/open-meteo-lk-docs-client';

const client = new OpenMeteoLkDocsClient({ defaultDelayMs: 1000 });
const data = await client.forecastColombo();
console.log(data);
```

## Methods

- `forecastColombo()` — GET `/v1/forecast` — Colombo daily forecast.
- `airQualityColombo()` — GET `/v1/air-quality` — Colombo air quality.
- `marineColombo()` — GET `/v1/marine` — Colombo marine wave height.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
