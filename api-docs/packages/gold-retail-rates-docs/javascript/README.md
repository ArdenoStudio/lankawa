# JavaScript client — Gold retail rates research pack

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { GoldRetailRatesDocsClient } from "./client.mjs";

const client = new GoldRetailRatesDocsClient({ defaultDelayMs: 1000 });
const data = await client.cbslGoldPage();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
