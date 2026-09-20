# JavaScript client — People's Bank Rates

> Unofficial · not affiliated · polite public reads only.

Zero-build ESM for Node ≥18 (native `fetch`). Typed twin lives in `../typescript/`.

## Usage

```js
import { PeoplesBankRatesDocsClient } from "./client.mjs";

const client = new PeoplesBankRatesDocsClient({ defaultDelayMs: 1000 });
const data = await client.exchangeRatesHtml();
console.log(data);
```

## Smoke

```bash
node examples/smoke.mjs
```
