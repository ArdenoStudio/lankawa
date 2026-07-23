# JavaScript client — Octane Fuel API

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { OctaneFuelApiDocsClient } from "./client.mjs";

const client = new OctaneFuelApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.pricesLatest();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
