# JavaScript client — Met Dept CAP / Advisories

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { MetdeptCapApiDocsClient } from "./client.mjs";

const client = new MetdeptCapApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.capEnRss();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
