# Client extras — `gdacs-firms-docs`

## Typed models

Canonical dataclass / TS types from field-coverage domains: `weather_aqi`.

- Python: `python/gdacs_firms_docs/models.py`
- TypeScript: `typescript/src/models.ts`
- JavaScript: `javascript/models.mjs` (JSDoc typedefs)

## Pagination iterator

Lab endpoints: `firms_csv_lk`.

```python
from gdacs_firms_docs import GdacsFirmsDocsClient, iter_lab_endpoint

with GdacsFirmsDocsClient() as client:
    for page in iter_lab_endpoint(client, 'firms_csv_lk', max_pages=3, page_size=50):
        print(page.page, len(page.items), page.done)
```

```ts
import { GdacsFirmsDocsClient, iterLabEndpoint } from "./src/index.js";
const client = new GdacsFirmsDocsClient();
for await (const page of iterLabEndpoint(client as any, 'firms_csv_lk', { maxPages: 3 })) {
  console.log(page.page, page.items.length, page.done);
}
```

## Shard helper

```python
from gdacs_firms_docs import shard_groups, shard_page_numbers, shard_offsets

shard_groups(0, 4)           # CEB A–Y split
shard_page_numbers(1, 40, 1, 4)
shard_offsets(1000, 50, 2, 4)
```
