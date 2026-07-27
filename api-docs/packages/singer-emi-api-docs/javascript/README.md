# JavaScript client — Singer Sri Lanka EMI API

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { SingerEmiApiDocsClient } from "./client.mjs";

const client = new SingerEmiApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.jsonGetEmi();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
