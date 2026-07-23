# JavaScript client — Amana / Union / Cargills Bank rates & offers

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { AmanaUnionCargillsBankDocsClient } from "./client.mjs";

const client = new AmanaUnionCargillsBankDocsClient({ defaultDelayMs: 1000 });
const data = await client.amanaRates();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
