# Client extras — `cse-api-docs-deepen`

## Typed models

Canonical dataclass / TS types from field-coverage domains: `markets_cse`.

- Python: `python/cse_api_docs_deepen/models.py`
- TypeScript: `typescript/src/models.ts`
- JavaScript: `javascript/models.mjs` (JSDoc typedefs)

## Pagination iterator

Lab endpoints: `trade_summary`.

```python
from cse_api_docs_deepen import CseApiDocsDeepenClient, iter_lab_endpoint

with CseApiDocsDeepenClient() as client:
    for page in iter_lab_endpoint(client, 'trade_summary', max_pages=3, page_size=50):
        print(page.page, len(page.items), page.done)
```

```ts
import { CseApiDocsDeepenClient, iterLabEndpoint } from "./src/index.js";
const client = new CseApiDocsDeepenClient();
for await (const page of iterLabEndpoint(client as any, 'trade_summary', { maxPages: 3 })) {
  console.log(page.page, page.items.length, page.done);
}
```

## Shard helper

```python
from cse_api_docs_deepen import shard_groups, shard_page_numbers, shard_offsets

shard_groups(0, 4)           # CEB A–Y split
shard_page_numbers(1, 40, 1, 4)
shard_offsets(1000, 50, 2, 4)
```
