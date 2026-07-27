# JavaScript client — Litro + LAUGFS LPG price pages

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { LitroLaugfsLpgDocsClient } from "./client.mjs";

const client = new LitroLaugfsLpgDocsClient({ defaultDelayMs: 1000 });
const data = await client.litroPrices();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
