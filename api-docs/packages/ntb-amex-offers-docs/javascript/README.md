# JavaScript client — NTB Mastercard + Amex Offers

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { NtbAmexOffersDocsClient } from "./client.mjs";

const client = new NtbAmexOffersDocsClient({ defaultDelayMs: 1000 });
const data = await client.ntbPromotionsHub();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
