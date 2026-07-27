# JavaScript client — MyPromo.lk (park — ToS)

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { MypromoParkDocsClient } from "./client.mjs";

const client = new MypromoParkDocsClient({ defaultDelayMs: 1000 });
const data = await client.mypromoParked();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
