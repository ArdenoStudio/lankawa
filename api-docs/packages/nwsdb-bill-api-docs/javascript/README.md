# JavaScript client — NWSDB Bill Calculator API

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { NwsdbBillApiDocsClient } from "./client.mjs";

const client = new NwsdbBillApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.billCalculator();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
