# JavaScript client — HNB Venus API

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { HnbVenusApiDocsClient } from "./client.mjs";

const client = new HnbVenusApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.getExchangeRatesContentsWeb();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
