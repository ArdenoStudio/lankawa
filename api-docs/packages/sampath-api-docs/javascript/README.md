# JavaScript client — Sampath Bank API

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { SampathApiDocsClient } from "./client.mjs";

const client = new SampathApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.exchangeRates();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
