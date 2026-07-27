# Client extras — `cebcare-api-docs`

## Typed models

Canonical dataclass / TS types from field-coverage domains: `utilities`.

- Python: `python/cebcare_api_docs/models.py`
- TypeScript: `typescript/src/models.ts`
- JavaScript: `javascript/models.mjs` (JSDoc typedefs)

## Pagination iterator

Lab endpoints: `get_demand_mgmt_clusters`.

```python
from cebcare_api_docs import CebcareApiDocsClient, iter_lab_endpoint

with CebcareApiDocsClient() as client:
    for page in iter_lab_endpoint(client, 'get_demand_mgmt_clusters', max_pages=3, page_size=50):
        print(page.page, len(page.items), page.done)
```

```ts
import { CebcareApiDocsClient, iterLabEndpoint } from "./src/index.js";
const client = new CebcareApiDocsClient();
for await (const page of iterLabEndpoint(client as any, 'get_demand_mgmt_clusters', { maxPages: 3 })) {
  console.log(page.page, page.items.length, page.done);
}
```

## Shard helper

```python
from cebcare_api_docs import shard_groups, shard_page_numbers, shard_offsets

shard_groups(0, 4)           # CEB A–Y split
shard_page_numbers(1, 40, 1, 4)
shard_offsets(1000, 50, 2, 4)
```
