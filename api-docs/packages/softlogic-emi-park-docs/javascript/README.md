# JavaScript client — Softlogic EMI (park — heavy crawl)

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { SoftlogicEmiParkDocsClient } from "./client.mjs";

const client = new SoftlogicEmiParkDocsClient({ defaultDelayMs: 1000 });
const data = await client.variationDetailParked();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
