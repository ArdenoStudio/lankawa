# JavaScript client — Visa LK Perks API

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { VisaLkPerksApiDocsClient } from "./client.mjs";

const client = new VisaLkPerksApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.portalPerks();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
