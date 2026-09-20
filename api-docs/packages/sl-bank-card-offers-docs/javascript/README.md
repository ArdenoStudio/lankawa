# JavaScript client — SL Bank Supermarket Card Offers

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { SlBankCardOffersDocsClient } from "./client.mjs";

const client = new SlBankCardOffersDocsClient({ defaultDelayMs: 1000 });
const data = await client.packOverview();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
