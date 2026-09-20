# JavaScript client — Bank of Ceylon Rates

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { BocRatesDocsClient } from "./client.mjs";

const client = new BocRatesDocsClient({ defaultDelayMs: 1000 });
const data = await client.ratesTariffHtml();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
