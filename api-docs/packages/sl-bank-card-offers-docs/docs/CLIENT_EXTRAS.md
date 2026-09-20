# Client extras — `sl-bank-card-offers-docs`

## Typed models

Canonical dataclass / TS types from field-coverage domains: `card_offers`.

- Python: `python/sl_bank_card_offers_docs/models.py`
- TypeScript: `typescript/src/models.ts`
- JavaScript: `javascript/models.mjs` (JSDoc typedefs)

## Pagination iterator

Lab endpoints: `pack_overview`.

```python
from sl_bank_card_offers_docs import SlBankCardOffersDocsClient, iter_lab_endpoint

with SlBankCardOffersDocsClient() as client:
    for page in iter_lab_endpoint(client, 'pack_overview', max_pages=3, page_size=50):
        print(page.page, len(page.items), page.done)
```

```ts
import { SlBankCardOffersDocsClient, iterLabEndpoint } from "./src/index.js";
const client = new SlBankCardOffersDocsClient();
for await (const page of iterLabEndpoint(client as any, 'pack_overview', { maxPages: 3 })) {
  console.log(page.page, page.items.length, page.done);
}
```

## Shard helper

```python
from sl_bank_card_offers_docs import shard_groups, shard_page_numbers, shard_offsets

shard_groups(0, 4)           # CEB A–Y split
shard_page_numbers(1, 40, 1, 4)
shard_offsets(1000, 50, 2, 4)
```
