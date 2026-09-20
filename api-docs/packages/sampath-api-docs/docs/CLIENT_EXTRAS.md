# Client extras — `sampath-api-docs`

## Typed models

Canonical dataclass / TS types from field-coverage domains: `fx_tt`, `fd_deposits`, `card_offers`.

- Python: `python/sampath_api_docs/models.py`
- TypeScript: `typescript/src/models.ts`
- JavaScript: `javascript/models.mjs` (JSDoc typedefs)

## Pagination iterator

Lab endpoints: `card_promotions_super_markets`.

```python
from sampath_api_docs import SampathApiDocsClient, iter_lab_endpoint

with SampathApiDocsClient() as client:
    for page in iter_lab_endpoint(client, 'card_promotions_super_markets', max_pages=3, page_size=50):
        print(page.page, len(page.items), page.done)
```

```ts
import { SampathApiDocsClient, iterLabEndpoint } from "./src/index.js";
const client = new SampathApiDocsClient();
for await (const page of iterLabEndpoint(client as any, 'card_promotions_super_markets', { maxPages: 3 })) {
  console.log(page.page, page.items.length, page.done);
}
```

## Shard helper

```python
from sampath_api_docs import shard_groups, shard_page_numbers, shard_offsets

shard_groups(0, 4)           # CEB A–Y split
shard_page_numbers(1, 40, 1, 4)
shard_offsets(1000, 50, 2, 4)
```
