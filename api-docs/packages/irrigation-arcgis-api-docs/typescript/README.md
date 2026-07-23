# TypeScript client — Irrigation ArcGIS Gauges

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/irrigation-arcgis-api-docs-client` · Staging path: `api-docs/packages/irrigation-arcgis-api-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { IrrigationArcgisApiDocsClient } from '@cookie-cat21/irrigation-arcgis-api-docs-client';

const client = new IrrigationArcgisApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.gauges2ViewQuery();
console.log(data);
```

## Methods

- `gauges2ViewQuery()` — GET `/gauges_2_view/FeatureServer/0/query` — Latest river gauge readings.
- `rainfall24hr()` — GET `/24hr_rainfall/FeatureServer/0/query` — 24-hour rainfall FeatureServer.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
