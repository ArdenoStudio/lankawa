# JavaScript client — NDB Rates

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { NdbRatesDocsClient } from "./client.mjs";

const client = new NdbRatesDocsClient({ defaultDelayMs: 1000 });
const data = await client.exchangeRates();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
