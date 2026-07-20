# JavaScript client — FoodLK / Food Platform API

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { FoodlkApiDocsClient } from "./client.mjs";

const client = new FoodlkApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.openapi();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
