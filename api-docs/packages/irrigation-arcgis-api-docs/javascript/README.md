# JavaScript client — Irrigation ArcGIS Gauges

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { IrrigationArcgisApiDocsClient } from "./client.mjs";

const client = new IrrigationArcgisApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.gauges2ViewQuery();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
