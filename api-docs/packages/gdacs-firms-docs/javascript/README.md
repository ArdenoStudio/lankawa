# JavaScript client — GDACS + NASA FIRMS

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { GdacsFirmsDocsClient } from "./client.mjs";

const client = new GdacsFirmsDocsClient({ defaultDelayMs: 1000 });
const data = await client.gdacsEventsRss();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
