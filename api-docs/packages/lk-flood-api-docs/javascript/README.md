# JavaScript client — lk-flood-api (nuuuwan)

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { LkFloodApiDocsClient } from "./client.mjs";

const client = new LkFloodApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.floodLatest();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
