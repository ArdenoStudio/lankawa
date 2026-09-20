# JavaScript client — Seylan Bank API

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { SeylanApiDocsClient } from "./client.mjs";

const client = new SeylanApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.exchangeRatesUsd();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
