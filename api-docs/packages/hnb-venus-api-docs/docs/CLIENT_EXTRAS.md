# Client extras — `hnb-venus-api-docs`

## Typed models

Canonical dataclass / TS types from field-coverage domains: `fx_tt`, `fd_deposits`, `card_offers`.

- Python: `python/hnb_venus_api_docs/models.py`
- TypeScript: `typescript/src/models.ts`
- JavaScript: `javascript/models.mjs` (JSDoc typedefs)

## Pagination iterator

Lab endpoints: `get_all_web_card_promos`, `get_all_web_card_promos_debit`.

```python
from hnb_venus_api_docs import HnbVenusApiDocsClient, iter_lab_endpoint

with HnbVenusApiDocsClient() as client:
    for page in iter_lab_endpoint(client, 'get_all_web_card_promos', max_pages=3, page_size=50):
        print(page.page, len(page.items), page.done)
```

```ts
import { HnbVenusApiDocsClient, iterLabEndpoint } from "./src/index.js";
const client = new HnbVenusApiDocsClient();
for await (const page of iterLabEndpoint(client as any, 'get_all_web_card_promos', { maxPages: 3 })) {
  console.log(page.page, page.items.length, page.done);
}
```

## Shard helper

```python
from hnb_venus_api_docs import shard_groups, shard_page_numbers, shard_offsets

shard_groups(0, 4)           # CEB A–Y split
shard_page_numbers(1, 40, 1, 4)
shard_offsets(1000, 50, 2, 4)
```
