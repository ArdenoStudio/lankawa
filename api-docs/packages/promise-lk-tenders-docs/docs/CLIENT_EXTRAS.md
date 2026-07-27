# Client extras — `promise-lk-tenders-docs`

## Typed models

Canonical dataclass / TS types from field-coverage domains: `platform_misc`.

- Python: `python/promise_lk_tenders_docs/models.py`
- TypeScript: `typescript/src/models.ts`
- JavaScript: `javascript/models.mjs` (JSDoc typedefs)

## Pagination iterator

Lab endpoints: `procurements_list`.

```python
from promise_lk_tenders_docs import PromiseLkTendersDocsClient, iter_lab_endpoint

with PromiseLkTendersDocsClient() as client:
    for page in iter_lab_endpoint(client, 'procurements_list', max_pages=3, page_size=50):
        print(page.page, len(page.items), page.done)
```

```ts
import { PromiseLkTendersDocsClient, iterLabEndpoint } from "./src/index.js";
const client = new PromiseLkTendersDocsClient();
for await (const page of iterLabEndpoint(client as any, 'procurements_list', { maxPages: 3 })) {
  console.log(page.page, page.items.length, page.done);
}
```

## Shard helper

```python
from promise_lk_tenders_docs import shard_groups, shard_page_numbers, shard_offsets

shard_groups(0, 4)           # CEB A–Y split
shard_page_numbers(1, 40, 1, 4)
shard_offsets(1000, 50, 2, 4)
```
