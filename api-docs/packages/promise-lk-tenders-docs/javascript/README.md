# JavaScript client — Promise.lk tenders

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { PromiseLkTendersDocsClient } from "./client.mjs";

const client = new PromiseLkTendersDocsClient({ defaultDelayMs: 1000 });
const data = await client.procurementsList();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
