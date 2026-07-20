# JavaScript client — OpenAQ Sri Lanka

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { OpenaqLkDocsClient } from "./client.mjs";

const client = new OpenaqLkDocsClient({ defaultDelayMs: 1000 });
const data = await client.locationsLk();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
