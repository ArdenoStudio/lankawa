# JavaScript client — Pan Asia Bank Card Offers

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { PabcCardOffersDocsClient } from "./client.mjs";

const client = new PabcCardOffersDocsClient({ defaultDelayMs: 1000 });
const data = await client.cardOffersJs();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
