# JavaScript client — SL Bank Remittance TT Rates

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { SlBankRemittanceTtDocsClient } from "./client.mjs";

const client = new SlBankRemittanceTtDocsClient({ defaultDelayMs: 1000 });
const data = await client.packOverview();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
