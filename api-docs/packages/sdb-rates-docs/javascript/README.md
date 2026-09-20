# JavaScript client — SANASA Development Bank rates

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { SdbRatesDocsClient } from "./client.mjs";

const client = new SdbRatesDocsClient({ defaultDelayMs: 1000 });
const data = await client.ratesPage();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
