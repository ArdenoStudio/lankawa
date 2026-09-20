# JavaScript client — Ardeno Sister Backends

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { ArdenoSisterBackendsDocsClient } from "./client.mjs";

const client = new ArdenoSisterBackendsDocsClient({ defaultDelayMs: 1000 });
const data = await client.foodlkOpenapi();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
