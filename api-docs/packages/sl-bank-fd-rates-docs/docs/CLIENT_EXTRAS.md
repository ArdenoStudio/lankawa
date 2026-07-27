# Client extras — `sl-bank-fd-rates-docs`

## Typed models

Canonical dataclass / TS types from field-coverage domains: `fd_deposits`.

- Python: `python/sl_bank_fd_rates_docs/models.py`
- TypeScript: `typescript/src/models.ts`
- JavaScript: `javascript/models.mjs` (JSDoc typedefs)

## Pagination iterator

Lab endpoints: _(none — client_slice helpers still available)_.

```python
from sl_bank_fd_rates_docs import SlBankFdRatesDocsClient, iter_lab_endpoint

with SlBankFdRatesDocsClient() as client:
    for page in iter_lab_endpoint(client, None, max_pages=3, page_size=50):
        print(page.page, len(page.items), page.done)
```

```ts
import { SlBankFdRatesDocsClient, iterLabEndpoint } from "./src/index.js";
const client = new SlBankFdRatesDocsClient();
for await (const page of iterLabEndpoint(client as any, None, { maxPages: 3 })) {
  console.log(page.page, page.items.length, page.done);
}
```

## Shard helper

```python
from sl_bank_fd_rates_docs import shard_groups, shard_page_numbers, shard_offsets

shard_groups(0, 4)           # CEB A–Y split
shard_page_numbers(1, 40, 1, 4)
shard_offsets(1000, 50, 2, 4)
```
