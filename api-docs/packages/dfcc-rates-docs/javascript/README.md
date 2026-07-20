# JavaScript client — DFCC Rates & Card Offers

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { DfccRatesDocsClient } from "./client.mjs";

const client = new DfccRatesDocsClient({ defaultDelayMs: 1000 });
const data = await client.interestRatesPage();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
