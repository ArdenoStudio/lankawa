# JavaScript client — Standard Chartered + HSBC LK offers (park notes)

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { ScHsbcOffersParkDocsClient } from "./client.mjs";

const client = new ScHsbcOffersParkDocsClient({ defaultDelayMs: 1000 });
const data = await client.scTglOffersJsonParked();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
