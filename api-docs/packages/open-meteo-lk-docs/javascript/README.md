# JavaScript client — Open-Meteo Sri Lanka Recipes

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { OpenMeteoLkDocsClient } from "./client.mjs";

const client = new OpenMeteoLkDocsClient({ defaultDelayMs: 1000 });
const data = await client.forecastColombo();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
