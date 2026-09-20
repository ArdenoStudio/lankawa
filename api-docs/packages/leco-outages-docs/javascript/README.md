# JavaScript client — LECO Outage Notices

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { LecoOutagesDocsClient } from "./client.mjs";

const client = new LecoOutagesDocsClient({ defaultDelayMs: 1000 });
const data = await client.interruptionNotices();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
