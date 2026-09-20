# JavaScript client — WFP HDX Sri Lanka Food Prices

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { WfpHdxLkaFoodDocsClient } from "./client.mjs";

const client = new WfpHdxLkaFoodDocsClient({ defaultDelayMs: 1000 });
const data = await client.wfpFoodPricesLkaCsv();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
