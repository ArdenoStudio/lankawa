# JavaScript client — CSE (cse.lk) API — deepen pack

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { CseApiDocsDeepenClient } from "./client.mjs";

const client = new CseApiDocsDeepenClient({ defaultDelayMs: 1000 });
const data = await client.topGainers();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
